/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye, Plus, Search, ListChecks } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { useTranslation } from "react-i18next";

axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "https://wee-marlie-soulaimaneportfolio-23357b65.koyeb.app";

/* ------------------------- Helpers ------------------------- */
const priorityBadgeClass = (priority) => {
  const p = (priority || "").toLowerCase();
  if (p === "low") return "badge badge-priority-low";
  if (p === "high") return "badge badge-priority-high";
  return "badge badge-priority-medium";
};

const isOverdue = (task) => {
  if (!task?.dueDate) return false;
  if (task.status === "Done") return false;

  const due = new Date(task.dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
};

const formatDate = (dateString, locale, fallback) => {
  if (!dateString) return fallback;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return fallback;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
};

/* ------------------------- Modals ------------------------- */
const Backdrop = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    onMouseDown={onClose}
  >
    <div onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-xl">
      {children}
    </div>
  </div>
);

const TaskDetailModal = ({ task, onClose, t, locale }) => (
  <Backdrop onClose={onClose}>
    <div className="app-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-app-text">
            {t("tasks.taskDetails")}
          </h2>
          <p className="text-sm text-app-muted mt-1">{task.title}</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
          aria-label="close"
          title={t("common.close")}
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <p>
          <span className="font-semibold">{t("tasks.titleLabel")}:</span>{" "}
          {task.title}
        </p>
        <p className="whitespace-pre-wrap">
          <span className="font-semibold">{t("tasks.descriptionLabel")}:</span>{" "}
          {task.description}
        </p>
        <p>
          <span className="font-semibold">{t("tasks.statusLabel")}:</span>{" "}
          {task.status}
        </p>
        <p>
          <span className="font-semibold">{t("tasks.priorityLabel")}:</span>{" "}
          {task.priority}
        </p>
        <p>
          <span className="font-semibold">{t("tasks.dueDateLabel")}:</span>{" "}
          {formatDate(task.dueDate, locale, t("common.notSet"))}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="app-button">
          {t("common.close")}
        </button>
      </div>
    </div>
  </Backdrop>
);

const EditTaskModal = ({ task, onSave, onClose, t }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="app-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-app-text">
              {t("tasks.editTask")}
            </h2>
            <p className="text-sm text-app-muted mt-1">{task.title}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="close"
            title={t("common.close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <div>
            <label className="text-sm font-semibold text-app-text">
              {t("tasks.titleLabel")}
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className="app-input mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-app-text">
              {t("tasks.descriptionLabel")}
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              className="app-input mt-1 min-h-[110px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-app-text">
                {t("tasks.statusLabel")}
              </label>
              <select
                value={editedTask.status}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, status: e.target.value })
                }
                className="app-input mt-1"
              >
                <option value="To Do">{t("tasks.status.todo")}</option>
                <option value="In Progress">
                  {t("tasks.status.inProgress")}
                </option>
                <option value="Done">{t("tasks.status.done")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-app-text">
                {t("tasks.priorityLabel")}
              </label>
              <select
                value={editedTask.priority}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, priority: e.target.value })
                }
                className="app-input mt-1"
              >
                <option value="Low">{t("tasks.priority.low")}</option>
                <option value="Medium">{t("tasks.priority.medium")}</option>
                <option value="High">{t("tasks.priority.high")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-app-text">
              {t("tasks.dueDateLabel")}
            </label>
            <input
              type="date"
              value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, dueDate: e.target.value })
              }
              className="app-input mt-1"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="app-button-outline">
            {t("common.cancel")}
          </button>
          <button onClick={handleSave} className="app-button">
            {t("common.save")}
          </button>
        </div>
      </div>
    </Backdrop>
  );
};

/* ------------------------- Empty States ------------------------- */
const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="app-card">
    <div className="flex flex-col items-center text-center gap-3 py-8">
      <div className="w-12 h-12 rounded-2xl border border-app-border bg-gray-50 flex items-center justify-center">
        <ListChecks size={22} />
      </div>
      <h3 className="text-lg font-bold text-app-text">{title}</h3>
      <p className="text-sm text-app-muted max-w-md">{description}</p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="app-button mt-2 inline-flex items-center gap-2">
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

const NoResultsState = ({ title, description, onClear, clearLabel }) => (
  <div className="app-card">
    <div className="flex flex-col items-center text-center gap-3 py-8">
      <div className="w-12 h-12 rounded-2xl border border-app-border bg-gray-50 flex items-center justify-center">
        <Search size={20} />
      </div>
      <h3 className="text-lg font-bold text-app-text">{title}</h3>
      <p className="text-sm text-app-muted max-w-md">{description}</p>
      <button onClick={onClear} className="app-button-outline mt-2">
        {clearLabel}
      </button>
    </div>
  </div>
);

/* ------------------------- Main ------------------------- */
const TrelloBoard = () => {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language || "en").startsWith("de") ? "de-DE" : "en-US";

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/tasks`);
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [dispatch, navigate]);

  const columns = useMemo(
    () => ({
      todo: {
        id: "todo",
        title: t("tasks.status.todo"),
        accent: "col-accent col-accent-todo",
        tasks: tasks.filter((task) => task.status === "To Do"),
      },
      inProgress: {
        id: "inProgress",
        title: t("tasks.status.inProgress"),
        accent: "col-accent col-accent-progress",
        tasks: tasks.filter((task) => task.status === "In Progress"),
      },
      done: {
        id: "done",
        title: t("tasks.status.done"),
        accent: "col-accent col-accent-done",
        tasks: tasks.filter((task) => task.status === "Done"),
      },
    }),
    [tasks, t]
  );

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const task = columns[source.droppableId].tasks[source.index];

    const updatedTask = {
      ...task,
      status:
        destination.droppableId === "inProgress"
          ? "In Progress"
          : destination.droppableId === "done"
          ? "Done"
          : "To Do",
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${task._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const addNewTask = async () => {
    const newTask = {
      title: t("tasks.newTaskTitle"),
      description: t("tasks.newTaskDescription"),
      status: "To Do",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(`${API_URL}/api/v1/tasks`, newTask);
      dispatch(addTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${updatedTask._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="app-card flex flex-col items-center justify-center gap-4">
        <p className="text-app-text font-semibold text-center">
          {t("messages.initialLoadingMayTake")}
        </p>
        <ClipLoader loading={loading} size={48} />
      </div>
    );
  }

  if (error) return <div className="app-card">{t("common.error", { error })}</div>;

  // ✅ Empty state (no tasks at all)
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        title={t("ui.empty.title")}
        description={t("ui.empty.description")}
        actionLabel={t("ui.empty.action")}
        onAction={addNewTask}
      />
    );
  }

  // Search + sort
  const q = searchTerm.toLowerCase();
  const searched = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q)
  );

  const sorted = [...searched].sort((a, b) => {
    if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
    const da = new Date(a.createdAt || a.updatedAt || a.dueDate || 0).getTime();
    const db = new Date(b.createdAt || b.updatedAt || b.dueDate || 0).getTime();
    return db - da;
  });

  const filteredColumns = {
    todo: { ...columns.todo, tasks: sorted.filter((t) => t.status === "To Do") },
    inProgress: {
      ...columns.inProgress,
      tasks: sorted.filter((t) => t.status === "In Progress"),
    },
    done: { ...columns.done, tasks: sorted.filter((t) => t.status === "Done") },
  };

  // ✅ Dashboard stats (based on ALL tasks)
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === "To Do").length;
  const progressCount = tasks.filter((t) => t.status === "In Progress").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;

  // ✅ No results state (search returned nothing)
  const hasSearch = searchTerm.trim().length > 0;
  const noResults = hasSearch && sorted.length === 0;

  // ✅ Helper for translated "task(s)"
  const taskCountLabel = (count) =>
    t("ui.taskCount", { count, defaultValue: count === 1 ? "task" : "tasks" });

  return (
    <div className="space-y-4">
      {/* ✅ Dashboard (responsive polish) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card col-span-2 sm:col-span-1">
          <div className="stat-label">{t("tasks.total", { defaultValue: "Total" })}</div>
          <div className="stat-value">{totalCount}</div>
          <div className="stat-chip chip-muted">
            {t("tasks.allTasks", { defaultValue: "All tasks" })}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{t("tasks.status.todo")}</div>
          <div className="stat-value">{todoCount}</div>
          <div className="stat-chip chip-muted">{t("tasks.status.todo")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{t("tasks.status.inProgress")}</div>
          <div className="stat-value">{progressCount}</div>
          <div className="stat-chip chip-primary">{t("tasks.status.inProgress")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{t("tasks.status.done")}</div>
          <div className="stat-value">{doneCount}</div>
          <div className="stat-chip chip-success">{t("tasks.status.done")}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{t("tasks.overdue", { defaultValue: "Overdue" })}</div>
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-chip chip-danger">
            {t("tasks.needsAttention", { defaultValue: "Needs attention" })}
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="app-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button className="app-button inline-flex items-center gap-2" onClick={addNewTask}>
          <Plus size={18} />
          {t("tasks.addTask")}
        </button>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder={t("tasks.searchPlaceholder")}
            className="app-input md:w-[260px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="app-input md:w-[190px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">{t("tasks.sortRecent")}</option>
            <option value="alphabetical">{t("tasks.sortAlphabetical")}</option>
          </select>
        </div>
      </div>

      {/* ✅ No results */}
      {noResults ? (
        <NoResultsState
          title={t("ui.noResults.title")}
          description={t("ui.noResults.description")}
          clearLabel={t("ui.noResults.clear")}
          onClear={() => setSearchTerm("")}
        />
      ) : (
        /* Board */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.values(filteredColumns).map((column) => (
              <div key={column.id} className="app-column overflow-hidden">
                <div className={column.accent} />

                <div className="app-column-header">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-app-text">
                        {column.title}
                      </h2>
                      <p className="text-xs text-app-muted mt-1">
                        {column.tasks.length} {taskCountLabel(column.tasks.length)}
                      </p>
                    </div>

                    <span className="badge badge-status">{column.title}</span>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="app-column-body"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`app-task group ${
                                isOverdue(task) ? "ring-2 ring-red-200" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="font-bold text-app-text truncate">
                                    {task.title}
                                  </h3>
                                  <p className="text-sm text-app-muted mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                </div>

                                {/* Actions تظهر عند hover */}
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => deleteTask(task._id)}
                                    className="p-2 rounded-xl hover:bg-red-50 transition text-app-danger"
                                    aria-label="delete"
                                    title={t("common.delete", { defaultValue: "Delete" })}
                                  >
                                    <X size={16} />
                                  </button>

                                  <button
                                    onClick={() => setEditTask(task)}
                                    className="p-2 rounded-xl hover:bg-blue-50 transition text-app-primary"
                                    aria-label="edit"
                                    title={t("common.edit", { defaultValue: "Edit" })}
                                  >
                                    <Edit size={16} />
                                  </button>

                                  <button
                                    onClick={() => setViewTask(task)}
                                    className="p-2 rounded-xl hover:bg-green-50 transition text-app-success"
                                    aria-label="view"
                                    title={t("common.view", { defaultValue: "View" })}
                                  >
                                    <Eye size={16} />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                                <span className={priorityBadgeClass(task.priority)}>
                                  {task.priority}
                                </span>

                                <span
                                  className={
                                    isOverdue(task)
                                      ? "text-red-600 font-semibold"
                                      : "text-app-muted"
                                  }
                                >
                                  {formatDate(task.dueDate, locale, t("common.notSet"))}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Modals */}
      {viewTask && (
        <TaskDetailModal
          task={viewTask}
          onClose={() => setViewTask(null)}
          t={t}
          locale={locale}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          onSave={handleEditTask}
          onClose={() => setEditTask(null)}
          t={t}
        />
      )}
    </div>
  );
};

export default TrelloBoard;
