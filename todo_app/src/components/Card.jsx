import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import clock from "../assets/clock.png";
import { useState } from "react";

export default function Card({
  id,
  title,
  tags,
  duedate,
  level,
  setshowTask,
  refreshPage,
  placeholder,
  setid,
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const [showDelete, setshowDelete] = useState(false);
  const dragListeners = showDelete ? {} : listeners;

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const priorityLevelClasses = {
    Optional: "bg-optional",
    Low: "bg-low",
    Medium: "bg-medium",
    High: "bg-high",
    Critical: "bg-critical",
  };

  function handleDelete() {
    fetch("http://localhost:5000/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, placeholder }),
    })
      .then(() => {
        refreshPage(); // <- trigger re-fetch in Columns
        setshowDelete(false);
      })
      .catch((err) => console.error("Task creation error", err));
  }

  return (
    <div
      onDoubleClick={() => {
        setid(id);
        setshowTask(true);
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // prevent default right-click menu
        setshowDelete(true);
      }}
      ref={setNodeRef}
      style={style}
      {...dragListeners}
      {...attributes}
      className="card"
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          className="card-tag"
          style={{
            color: tag.color,
            backgroundColor: `${tag.color}4D`,
          }}
        >
          {tag.name}
        </span>
      ))}

      <h1 className="card-tittle">{title}</h1>
      <div className="card-date-idlevel">
        <div className="card-date-section">
          <img className="card-clock" src={clock} alt="Logo" />
          <h2 className="card-date">{duedate}</h2>
        </div>
        <div className="card-id-level">
          <h2 className="card-id">ID - {id}</h2>

          <h2
            className={`card-level ${
              priorityLevelClasses[level] || "bg-default"
            }`}
          >
            {level}
          </h2>
        </div>
      </div>
      {showDelete && (
        <div className="delete">
          <div className="delete-text">
            <h1 className="delete-text-1">Delete tasks - #{id}?</h1>
            <div className="delete-options">
              <div
                onClick={() => {
                  handleDelete();
                }}
                className="delete-item"
              >
                Yes
              </div>
              <div
                className="delete-item-1"
                onClick={() => {
                  setshowDelete(false);
                }}
              >
                No
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
