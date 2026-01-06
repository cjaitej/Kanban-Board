import add_circle from "../assets/add.svg";
import close from "../assets/close.svg";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Createtask({
  setshowCreateTask,
  sections,
  selected_section,
  id,
  refreshPage,
}) {
  const [visibleIndex, setVisibleIndex] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showSubList, setshowSubList] = useState(false);
  const [dueDate, setdueDate] = useState(new Date());
  const [tagValue, settagValue] = useState("");
  const [stage, setstage] = useState(selected_section);
  const [selectedPriority, setSelectedPriority] = useState("Optional");
  const [sublist, setsublist] = useState([]);
  const [taglist, settaglist] = useState([]);
  const priority = ["Optional", "Low", "Medium", "High", "Critical"];
  const today = new Date();
  const created_date = `${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;

  const priorityLevelClasses = {
    Optional: "bg-optional",
    Low: "bg-low",
    Medium: "bg-medium",
    High: "bg-high",
    Critical: "bg-critical",
  };

  function handleRemoveTag(text) {
    settaglist((prev) => prev.filter((tag) => tag !== text));
  }

  function handleRemoveSubTask(text) {
    setsublist((prev) => prev.filter((task) => task !== text));
  }

  function handleEnterSubList(value) {
    if (value.length > 0) {
      setsublist((prev) => [...prev, value]);
    }
    setshowSubList(false);
  }

  function handleEnterTag(value) {
    if (value.length > 0) {
      settaglist((prev) => [...prev, value]);
    }
  }

  function handleCreate() {
    if (title.length === 0) {
      alert("Please Enter Title");
      return;
    }

    if (taglist.length === 0) {
      alert("Please Enter Tags");
      return;
    }

    const newTask = {
      id: id,
      title: title,
      description: description,
      subtask: sublist,
      stage: stage,
      priority: selectedPriority,
      duedate: `${String(dueDate.getMonth() + 1).padStart(2, "0")}/${String(
        dueDate.getDate()
      ).padStart(2, "0")}/${dueDate.getFullYear()}`,
      tags: taglist,
      created_date: created_date,
    };

    fetch("http://localhost:5000/addTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then(() => {
        refreshPage();
        setshowCreateTask(false);
      })
      .catch((err) => console.error("Task creation error", err));
  }

  function handleCancel() {
    setshowCreateTask(false);
  }
  return (
    <div className="createtask-full-screen-blur">
      <div className="createtask-body">
        <div className="createtask-heading">Create a Task</div>
        <div className="createtask-main">
          <div className="createtask-main-left">
            <input
              type="text"
              className="createtask-main-left-title"
              placeholder="Title*"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="createtask-main-left-desc">
              <div>Description</div>
              <textarea
                className="createtask-main-left-desc-item"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <div className="createtask-main-left-subtask">
                Subtask
                {sublist.length < 5 && (
                  <div
                    className="createtask-main-left-subtaskbutton"
                    onClick={() => {
                      setshowSubList(true);
                    }}
                  >
                    <img
                      className="createtask-main-add-subtask-logo"
                      src={add_circle}
                      alt="Logo"
                    />
                    <h1 className="createtask-main-left-addsubtask">
                      Add Subtask
                    </h1>
                  </div>
                )}
              </div>
              <div className="createtask-main-left-subtasklist">
                {showSubList && (
                  <input
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEnterSubList(e.target.value);
                      }
                    }}
                    className="entersublist"
                    type="text"
                    placeholder="Enter the sublist"
                  />
                )}
                {sublist.map((item, index) => (
                  <li
                    onMouseEnter={() => setVisibleIndex(index)}
                    onMouseLeave={() => setVisibleIndex(null)}
                    key={index}
                    className="subtasklist"
                  >
                    <div className="inside-sublist">
                      {item}
                      {visibleIndex === index && (
                        <div className="inside-sublist-buttons">
                          <div className="inside-sublist-buttons-done">
                            Done
                          </div>
                          <div
                            onClick={() => handleRemoveSubTask(item)}
                            className="inside-sublist-buttons-delete"
                          >
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </div>
            </div>
          </div>
          <div className="createtask-main-right">
            <div className="createtask-main-right-item">
              <div className="createtask-main-right-heading1">Set Stage</div>
              <select
                className="stage-option"
                defaultValue={selected_section}
                onChange={(e) => setstage(e.target.value)}
              >
                {sections.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="createtask-main-right-item">
              <div className="createtask-main-right-heading1">Set Priority</div>
              <div className="test">
                <select
                  className={`prio-option ${
                    priorityLevelClasses[selectedPriority] || "bg-default"
                  }`}
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  {priority.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="createtask-main-right-item">
              <div className="createtask-main-right-heading1">Due Date</div>
              <DatePicker
                className="calender"
                selected={dueDate}
                onChange={(date) => setdueDate(date)}
              />
            </div>
            <div className="createtask-main-right-item">
              <div className="createtask-main-right-heading1">Tags</div>
              <div className="createtask-taglist">
                {taglist.map((item, index) => (
                  <div className="tag">
                    <div
                      className="create-tag"
                      key={index}
                      style={{
                        color: "#B026FF",
                        backgroundColor: `${"#B026FF"}4D`,
                      }}
                    >
                      {item}
                    </div>
                    <img
                      onClick={() => {
                        handleRemoveTag(item);
                      }}
                      className="tag-delete"
                      src={close}
                      alt="close icon"
                    />
                  </div>
                ))}
              </div>
              {taglist.length < 3 && (
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEnterTag(e.target.value);
                      settagValue("");
                    }
                  }}
                  className="entertag"
                  value={tagValue}
                  maxLength={15}
                  onChange={(e) => settagValue(e.target.value)}
                  placeholder="+ Add a tag"
                />
              )}
            </div>
            <div className="createtask-main-right-item">
              <div className="createtask-main-right-heading1">Create Date</div>
              <div className="created-date">{created_date}</div>
            </div>
          </div>
        </div>
        <div className="createtask-button">
          <div onClick={handleCreate} className="createtask-button-create">
            Create
          </div>
          <div onClick={handleCancel} className="createtask-button-cancel">
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}
