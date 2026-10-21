"use client";

import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, TASK_CATEGORIES, TASK_PRIORITIES, type TaskView } from "@/lib/task-validation";
import { Icon } from "@/components/icon";

export function TaskForm({ task, disabled, error, onSave, onCancel }: {
  task?: TaskView; disabled: boolean; error?: string;
  onSave: (data: FormData, form: HTMLFormElement) => void;
  onCancel: () => void;
}) {
  const prefix = task ? `edit-${task.id}` : "new";
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      onSave(new FormData(event.currentTarget), event.currentTarget);
    }} aria-describedby={error ? `${prefix}-error` : undefined}>
      <fieldset disabled={disabled} className="task-fields">
        <div className="field"><label htmlFor={`${prefix}-title`}>Apa yang ingin kamu kerjakan?</label>
          <input id={`${prefix}-title`} name="title" defaultValue={task?.title ?? ""} required maxLength={MAX_TITLE_LENGTH} placeholder="Tulis satu tugas yang jelas…" />
        </div>
        <div className="field-grid">
          <div className="field"><label htmlFor={`${prefix}-category`}>Kategori</label>
            <select id={`${prefix}-category`} name="category" defaultValue={task?.category ?? "Pribadi"}>{TASK_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
          </div>
          <div className="field"><label htmlFor={`${prefix}-priority`}>Prioritas</label>
            <select id={`${prefix}-priority`} name="priority" defaultValue={task?.priority ?? "Sedang"}>{TASK_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>
          </div>
        </div>
        <div className="field"><label htmlFor={`${prefix}-dueDate`}>Tenggat <span>opsional</span></label>
          <input id={`${prefix}-dueDate`} type="date" name="dueDate" min="1900-01-01" max="9999-12-31" defaultValue={task?.dueDate ?? ""} />
        </div>
        <div className="field"><label htmlFor={`${prefix}-description`}>Catatan <span>opsional</span></label>
          <textarea id={`${prefix}-description`} name="description" defaultValue={task?.description ?? ""} rows={3} maxLength={MAX_DESCRIPTION_LENGTH} placeholder="Detail kecil yang membantu kamu mulai." />
        </div>
        {error && <p id={`${prefix}-error`} role="alert" className="form-error">{error}</p>}
        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>Batal</button>
          <button type="submit" className="primary-button">{disabled ? "Menyimpan…" : task ? "Simpan perubahan" : "Simpan tugas"}<Icon name="arrow" size={18} /></button>
        </div>
      </fieldset>
    </form>
  );
}
