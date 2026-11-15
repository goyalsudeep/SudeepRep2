 "use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, Circle, Clock3, ListTodo, Plus, Search, Target, Trash2, Pencil, X, ChevronDown, LayoutDashboard } from "lucide-react";

type Status = "Todo" | "In Progress" | "Done";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string; title: string; description: string; startDate: string; dueDate: string;
  status: Status; priority: Priority; progress: number; createdAt: string;
};
const STORAGE_KEY = "taskflow.tasks.v1";
const today = () => new Date().toISOString().slice(0, 10);
const emptyTask = (): Omit<Task, "id" | "createdAt"> => ({
  title: "", description: "", startDate: today(), dueDate: "", status: "Todo", priority: "Medium", progress: 0
});

function dateLabel(date: string) {
  if (!date) return "No date";
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function statusClass(status: Status) { return status.toLowerCase().replace(" ", "-"); }

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyTask());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [view, setView] = useState<"Tasks" | "Timeline">("Tasks");

  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setTasks(JSON.parse(saved)); }
    catch { /* ignore malformed local data */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks, loaded]);

  const stats = useMemo(() => {
    const done = tasks.filter(t => t.status === "Done").length;
    const active = tasks.filter(t => t.status === "In Progress").length;
    const overdue = tasks.filter(t => t.status !== "Done" && t.dueDate && t.dueDate < today()).length;
    const average = tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;
    return { total: tasks.length, done, active, overdue, average };
  }, [tasks]);

  const visible = useMemo(() => tasks.filter(t =>
    (filter === "All" || t.status === filter) &&
    (t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
  ).sort((a,b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, filter, query]);

  function openNew() { setEditing(null); setForm(emptyTask()); setModal(true); }
  function openEdit(task: Task) { setEditing(task); setForm({title:task.title,description:task.description,startDate:task.startDate,dueDate:task.dueDate,status:task.status,priority:task.priority,progress:task.progress}); setModal(true); }
  function saveTask(e: React.FormEvent) {
    e.preventDefault(); if (!form.title.trim()) return;
    const progress = form.status === "Done" ? 100 : Math.min(99, Math.max(0, Number(form.progress)));
    if (editing) setTasks(prev => prev.map(t => t.id === editing.id ? {...t, ...form, progress} : t));
    else setTasks(prev => [{...form, progress, id: crypto.randomUUID(), createdAt: new Date().toISOString()}, ...prev]);
    setModal(false);
  }
  function updateStatus(task: Task, status: Status) {
    setTasks(prev => prev.map(t => t.id === task.id ? {...t, status, progress: status === "Done" ? 100 : status === "Todo" ? 0 : Math.max(10,t.progress)} : t));
  }
  function removeTask(id: string) { if (confirm("Delete this task?")) setTasks(prev => prev.filter(t => t.id !== id)); }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><Target size={21}/></span><span>task<span className="brand-accent">flow</span></span></div>
      <div className="nav-label">WORKSPACE</div>
      <button className="nav-item active"><LayoutDashboard size={18}/> Overview</button>
      <button className="nav-item" onClick={() => {setFilter("All");setView("Tasks")}}><ListTodo size={18}/> All tasks <span className="nav-count">{tasks.length}</span></button>
      <button className="nav-item" onClick={() => {setFilter("In Progress");setView("Tasks")}}><Activity size={18}/> In progress</button>
      <button className="nav-item" onClick={() => {setFilter("Done");setView("Tasks")}}><CheckCircle2 size={18}/> Completed</button>
      <div className="sidebar-bottom"><div className="mini-card"><div className="mini-icon"><Target size={17}/></div><b>Make progress every day</b><p>Small steps add up to big results.</p></div><div className="profile"><div className="avatar">TF</div><div><b>My workspace</b><small>Personal planner</small></div></div></div>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><span className="today-label"><CalendarDays size={16}/>{dateLabel(today())}</span><button className="primary-btn" onClick={openNew}><Plus size={17}/> New task</button></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">YOUR PRODUCTIVITY SPACE</div><h1>Good work starts with a plan<span>.</span></h1><p className="subtitle">Keep your priorities clear and your progress moving.</p></div><div className="welcome-mark"><Target size={42}/></div></div>
        <div className="stats-grid">
          <Stat icon={<ListTodo/>} label="Total tasks" value={stats.total} tone="blue" note="Across your workspace"/>
          <Stat icon={<Activity/>} label="In progress" value={stats.active} tone="purple" note="Currently being worked on"/>
          <Stat icon={<CheckCircle2/>} label="Completed" value={stats.done} tone="green" note={`${stats.total ? Math.round(stats.done/stats.total*100) : 0}% of all tasks`}/>
          <Stat icon={<Clock3/>} label="Overdue" value={stats.overdue} tone="orange" note="Past their due date"/>
        </div>
        <div className="progress-overview panel"><div className="progress-heading"><div><span className="section-kicker">WORKSPACE HEALTH</span><h2>Overall progress</h2></div><div className="progress-number">{stats.average}<small>%</small></div></div><div className="progress-track big"><div style={{width:`${stats.average}%`}}/></div><div className="progress-foot"><span>{stats.done} of {stats.total} tasks completed</span><span>{stats.average}% average task progress</span></div></div>

        <div className="tasks-panel panel">
          <div className="panel-header"><div><span className="section-kicker">PLAN & EXECUTE</span><h2>Your tasks <span className="task-total">{tasks.length}</span></h2></div><button className="outline-btn" onClick={openNew}><Plus size={16}/> Add task</button></div>
          <div className="toolbar"><div className="tabs">{(["All","Todo","In Progress","Done"] as const).map(s=><button key={s} className={filter===s?"tab selected":"tab"} onClick={()=>setFilter(s)}>{s==="Todo"?"To do":s}</button>)}</div><div className="search-box"><Search size={16}/><input placeholder="Search tasks..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
          <div className="view-toggle"><button className={view==="Tasks"?"view-active":""} onClick={()=>setView("Tasks")}><ListTodo size={15}/> List</button><button className={view==="Timeline"?"view-active":""} onClick={()=>setView("Timeline")}><CalendarDays size={15}/> Timeline</button></div>
          {!loaded ? <div className="empty-state">Loading your workspace…</div> : visible.length===0 ? <div className="empty-state"><div className="empty-icon"><ListTodo size={24}/></div><h3>{tasks.length?"No tasks match":"Your workspace is ready"}</h3><p>{tasks.length?"Try another search or filter.":"Add your first task and start tracking progress."}</p>{!tasks.length&&<button className="primary-btn" onClick={openNew}><Plus size={16}/> Create your first task</button>}</div> : view==="Tasks" ? <div className="task-list">{visible.map(task=><TaskRow key={task.id} task={task} onEdit={()=>openEdit(task)} onDelete={()=>removeTask(task.id)} onStatus={s=>updateStatus(task,s)}/>)}</div> : <Timeline tasks={visible} onEdit={openEdit}/>}
          <div className="panel-footer"><span>Showing {visible.length} of {tasks.length} tasks</span><span>Sorted by due date <ChevronDown size={13}/></span></div>
        </div>
        <footer>TaskFlow <span>·</span> A little progress, every day.</footer>
      </div>
    </section>

    {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal" onSubmit={saveTask}><div className="modal-head"><div><span className="section-kicker">{editing?"UPDATE TASK":"NEW TASK"}</span><h2>{editing?"Edit task":"Create a task"}</h2></div><button type="button" className="icon-btn" onClick={()=>setModal(false)}><X size={19}/></button></div>
      <label>Task name <span>*</span><input autoFocus required placeholder="e.g. Prepare project kickoff" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Description<textarea placeholder="Add details, notes or next steps…" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <div className="form-grid"><label>Start date<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label><label>Due date<input type="date" value={form.dueDate} min={form.startDate||undefined} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label></div>
      <div className="form-grid"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as Status,progress:e.target.value==="Done"?100:e.target.value==="Todo"?0:form.progress})}><option>Todo</option><option>In Progress</option><option>Done</option></select></label></div>
      <label className="progress-label">Progress <b>{form.status==="Done"?100:form.progress}%</b><input type="range" min="0" max="100" value={form.status==="Done"?100:form.progress} disabled={form.status==="Done"} onChange={e=>setForm({...form,progress:Number(e.target.value),status:Number(e.target.value)>0?"In Progress":"Todo"})}/></label>
      <div className="modal-actions"><button type="button" className="outline-btn" onClick={()=>setModal(false)}>Cancel</button><button className="primary-btn" type="submit">{editing?"Save changes":"Create task"}</button></div>
    </form></div>}
  </main>;
}

function Stat({icon,label,value,tone,note}:{icon:React.ReactNode,label:string,value:number,tone:string,note:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
function TaskRow({task,onEdit,onDelete,onStatus}:{task:Task,onEdit:()=>void,onDelete:()=>void,onStatus:(s:Status)=>void}) {
  const overdue=task.status!=="Done"&&task.dueDate&&task.dueDate<today();
  return <article className="task-row"><div className="task-check" onClick={()=>onStatus(task.status==="Done"?"Todo":"Done")} title="Toggle completed">{task.status==="Done"?<CheckCircle2 size={20}/>:<Circle size={20}/>}</div><div className="task-main"><div className="task-title-line"><h3 className={task.status==="Done"?"completed":""}>{task.title}</h3><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>{task.description&&<p className="task-description">{task.description}</p>}<div className="task-meta"><span><CalendarDays size={13}/>{task.startDate?dateLabel(task.startDate):"No start date"} → {task.dueDate?dateLabel(task.dueDate):"No due date"}</span>{overdue&&<span className="overdue">Overdue</span>}</div><div className="task-progress"><div className="progress-track"><div style={{width:`${task.progress}%`}}/></div><span>{task.progress}%</span></div></div><div className="task-right"><select aria-label="Task status" className={`status-select ${statusClass(task.status)}`} value={task.status} onChange={e=>onStatus(e.target.value as Status)}><option>Todo</option><option>In Progress</option><option>Done</option></select><div className="task-actions"><button className="icon-btn" title="Edit" onClick={onEdit}><Pencil size={15}/></button><button className="icon-btn delete-btn" title="Delete" onClick={onDelete}><Trash2 size={15}/></button></div></div></article>;
}
function Timeline({tasks,onEdit}:{tasks:Task[],onEdit:(t:Task)=>void}) {
  const dated=tasks.filter(t=>t.startDate||t.dueDate);
  if(!dated.length)return <div className="empty-state"><CalendarDays size={25}/><h3>No dates to display</h3><p>Add start and due dates to your tasks to see a timeline.</p></div>;
  return <div className="timeline-list">{dated.map(t=><div className="timeline-item" key={t.id}><div className="timeline-dates"><b>{dateLabel(t.startDate||t.dueDate)}</b><span>{t.dueDate?`Due ${dateLabel(t.dueDate)}`:"No due date"}</span></div><div className="timeline-dot"/><button className="timeline-task" onClick={()=>onEdit(t)}><div><b>{t.title}</b><span className={`status-text ${statusClass(t.status)}`}>{t.status}</span></div><div className="progress-track"><div style={{width:`${t.progress}%`}}/></div><small>{t.progress}% complete</small></button></div>)}</div>;
}