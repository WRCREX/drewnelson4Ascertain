import { useState } from "react";

import { useCreateNote, useDeleteNote, usePatientNotes } from "../hooks/usePatients";
import { styles } from "../styles";

export function NotesSection({ patientId }: { patientId: number }) {
  const [draft, setDraft] = useState("");
  const { data: notes, isPending, isError, error } = usePatientNotes(patientId);
  const createNote = useCreateNote(patientId);
  const deleteNote = useDeleteNote(patientId);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await createNote.mutateAsync(draft.trim());
    setDraft("");
  }

  return (
    <div className={styles.cardPad}>
      <h2 className={styles.sectionTitle}>Clinical Notes</h2>

      <form onSubmit={addNote} className="mt-4 flex flex-col gap-2">
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="Add a clinical note..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={createNote.isPending || !draft.trim()}
          >
            {createNote.isPending ? "Adding..." : "Add Note"}
          </button>
          {createNote.isError && (
            <span className={styles.fieldError}>{(createNote.error as Error).message}</span>
          )}
        </div>
      </form>

      <div className="mt-4">
        {isPending ? (
          <div className={styles.spinner}>Loading notes...</div>
        ) : isError ? (
          <div className={styles.formError}>{(error as Error).message}</div>
        ) : notes.length === 0 ? (
          <div className={styles.emptyState}>No notes yet.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={styles.noteItem}>
              <div className="flex items-center justify-between">
                <p className={styles.noteMeta}>
                  {new Date(note.created_at).toLocaleString()}
                </p>
                <button
                  className={styles.btnGhostDanger}
                  onClick={() => deleteNote.mutate(note.id)}
                  disabled={deleteNote.isPending}
                >
                  Delete
                </button>
              </div>
              <p className={styles.noteContent}>{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
