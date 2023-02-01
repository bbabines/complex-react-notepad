import { useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { stringify, v4 as uuidV4 } from "uuid";

import NewNote from "./assets/components/NewNote";
import { useLocalStorage } from "./assets/components/useLocalStorage";
import NoteList from "./assets/components/NoteList";
import NoteLayout from "./assets/components/NoteLayout";
import Note from "./assets/components/Note";
import EditNote from "./assets/components/EditNote";

export type Note = {
	id: string;
} & NoteData;

export type RawNote = {
	id: string;
} & RawNoteData;

export type RawNoteData = {
	title: string;
	markdown: string;
	tagIds: string[];
};

export type NoteData = {
	title: string;
	markdown: string;
	tags: Tag[];
};

export type Tag = {
	id: string;
	label: string;
};

function App() {
	const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
	const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

	// Loop through all notes and keep notes with specific tagIds
	const notesWithTags = useMemo(() => {
		return notes.map((note) => {
			return {
				...note,
				tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
			};
		});
	}, [notes, tags]);

	// When a note is created, it will save it in notes array/local storage
	const onCreateNote = ({ tags, ...data }: NoteData) => {
		setNotes((prevNotes) => {
			return [
				...prevNotes,
				{ ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
			];
		});
	};

	const onDeleteNote = (id: string) => {
		setNotes((prevNotes) => {
			return prevNotes.filter((note) => note.id !== id);
		});
	};

	const addTag = (tag: Tag) => {
		setTags((prev) => [...prev, tag]);
	};

	const updateTag = (id: string, label: string) => {
		setTags((prevTags) => {
			return prevTags.map((tag) => {
				if (tag.id === id) {
					return { ...tag, label };
				} else {
					return tag;
				}
			});
		});
	};

	const deleteTag = (id: string) => {
		setTags((prevTags) => {
			return prevTags.filter((tag) => tag.id !== id);
		});
	};

	const onUpdateNote = (id: string, { tags, ...data }: NoteData) => {
		setNotes((prevNotes) => {
			return prevNotes.map((note) => {
				if (note.id === id) {
					return {
						...note,
						...data,
						tagIds: tags.map((tag) => tag.id),
					};
				} else {
					return note;
				}
			});
		});
	};

	return (
		<Container className="my-4">
			<Routes>
				<Route
					path="/"
					element={
						<NoteList
							notes={notesWithTags}
							availableTags={tags}
							onUpdateTag={updateTag}
							onDeleteTag={deleteTag}
						/>
					}
				/>
				<Route
					path="/new"
					element={
						<NewNote
							onSubmit={onCreateNote}
							onAddTag={addTag}
							availableTags={tags}
						/>
					}
				/>
				<Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
					<Route index element={<Note onDelete={onDeleteNote} />} />
					<Route
						path="edit"
						element={
							<EditNote
								onSubmit={onUpdateNote}
								onAddTag={addTag}
								availableTags={tags}
							/>
						}
					/>
				</Route>

				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Container>
	);
}

export default App;
