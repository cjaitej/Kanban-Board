import { useEffect, useState } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import add from "../assets/add.svg";
import Card from "./Card";
import Createtask from "./Createtask";
import DetailedCard from "./DetailedCard";

export default function Columns() {
  const [boardData, setBoardData] = useState({});

  const [showTask, setshowTask] = useState(false);

  const [showCreateTask, setshowCreateTask] = useState(false);

  const [id, setid] = useState(null);

  const sections = ["Backlogs", "To Do", "In Progress", "Done", "Review"];

  const [placeholder, setplaceholder] = useState(sections[0]);

  function generateUniqueId(boardData) {
    const existingIds = new Set(
      Object.values(boardData)
        .flat()
        .map((task) => task.id)
    );

    let id;
    do {
      id = Math.floor(Math.random() * 999);
    } while (existingIds.has(id));

    return id;
  }

  function DroppableColumn({ id, children }) {
    const { setNodeRef } = useDroppable({ id });
    return (
      <div ref={setNodeRef} id={id} className="column_items">
        {children}
      </div>
    );
  }

  const findSectionByTaskId = (id) => {
    return sections.find((section) =>
      boardData[section]?.some((card) => card.id === id)
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id;
    const fromSection = findSectionByTaskId(draggedId);
    const toSection = over.id;

    if (!fromSection || !toSection || fromSection === toSection) return;

    const draggedCard = boardData[fromSection].find((c) => c.id === draggedId);
    const newFrom = boardData[fromSection].filter((c) => c.id !== draggedId);
    const newTo = [...boardData[toSection], draggedCard];

    const updated = {
      ...boardData,
      [fromSection]: newFrom,
      [toSection]: newTo,
    };

    setBoardData(updated);

    const api_send = {
      id: draggedCard["id"],
      from: fromSection,
      to: toSection,
    };

    fetch("http://localhost:5000/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(api_send),
    });
  };

  const refreshBoardData = () => {
    fetch("http://localhost:5000/data")
      .then((res) => res.json())
      .then((data) => setBoardData(data))
      .catch((err) => console.error("Error loading data:", err));
  };

  useEffect(() => {
    refreshBoardData();
  }, []);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="column_section">
        {sections.map((section) => (
          <DroppableColumn
            className="section-columns"
            key={section}
            id={section}
          >
            <div className="section-heading">
              <div className="section-heading-1">
                <h2 className="section-name">{section}</h2>
                <h2 className="section-count">
                  {(boardData[section] || []).length}
                </h2>
              </div>
              <img
                className="section-add-icon"
                onClick={() => {
                  setplaceholder(section);
                  setshowCreateTask(true);
                }}
                src={add}
                alt="Logo"
              />
            </div>
            <div className="section-cards">
              {(boardData[section] || []).map((card, i) => (
                <Card
                  key={i}
                  setshowTask={setshowTask}
                  placeholder={section}
                  refreshPage={refreshBoardData}
                  {...card}
                  setid={setid}
                />
              ))}
            </div>

            {showCreateTask && (
              <Createtask
                setshowCreateTask={setshowCreateTask}
                sections={sections}
                selected_section={placeholder}
                id={generateUniqueId(boardData)}
                refreshPage={refreshBoardData}
              />
            )}
            {showTask && (
              <DetailedCard
                setshowCreateTask={setshowTask}
                sections={sections}
                selected_section={placeholder}
                id={id}
                refreshPage={refreshBoardData}
              />
            )}
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  );
}
