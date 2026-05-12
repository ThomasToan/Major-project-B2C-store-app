"use client";

import { marked } from "marked"; // imports mark to convert Markdown text into HTML
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
// useState: store changing values, useEffect: restore cursor position after preview closes
// useRef: store value without re-render: cursor start/end position, textarea DOM reference
// useMemo: caches computed value markdown HTML preview
import styles from "../app/page.module.css";

type EditorValues = { // defines shape of form data
  title: string;
  category: string;
  description: string;
  content: string;
  imageUrl: string;
  tags: string;
};

type ValidationErrors = Partial<Record<keyof EditorValues, string>>; // create an object where each of those key maps to string
// Partial not all keys are requried

function validate(values: EditorValues) {
  const errors: ValidationErrors = {}; // check current form value and builds an errors object

  if (!values.title.trim()) { // if the result empty, title invalid
    errors.title = "Title is required";
  }

  if (!values.description.trim()) { // description validation
    errors.description = "Description is required";
  } else if (values.description.length > 200) {
    errors.description =
      "Description is too long. Maximum is 200 characters";
  }

  if (!values.content.trim()) { // content validation
    errors.content = "Content is required";
  }

  if (!values.imageUrl.trim()) { // url validation
    errors.imageUrl = "Image URL is required";
  } else {
    try {
      new URL(values.imageUrl);
    } catch {
      errors.imageUrl = "This is not a valid URL";
    }
  }

  if (!values.tags.trim()) { // tag validation
    errors.tags = "At least one tag is required";
  }

  return errors; // return errors object
}

export function PostEditor({ // defines component
  initialValues, // starting values for form
  showCategory = true, // if it not pass, default is true
  saveAction,
  successMessage,
}: {
  initialValues: EditorValues;
  showCategory?: boolean;
  saveAction?: (formData: FormData) => void | Promise<void>; // PostEditor can receive a server action from update page and create page
  successMessage?: string;
}) {
  const [values, setValues] = useState(initialValues); // store editable form values
  const [errors, setErrors] = useState<ValidationErrors>({}); // store validation errors
  const [showFormError, setShowFormError] = useState(false); // controls whether to show message
  const [showPreview, setShowPreview] = useState(false); // whether content sections shows: textarea or rendered markdown preview
  const selectionRef = useRef({ start: 0, end: 0 }); // store textara cursor selection
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const allowSubmitRef = useRef(false);
  const hadValidationErrorsRef = useRef(false);

  const previewHtml = useMemo(
    () => marked.parse(values.content) as string,
    [values.content],
  );
  const imagePreviewSrc = values.imageUrl.trim() || undefined;

  useEffect(() => {
    if (!showPreview && contentRef.current) {
      contentRef.current.focus();
      contentRef.current.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end,
      );
    }
  }, [showPreview]);

  function setFieldValue(field: keyof EditorValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getCurrentFormValues(form: HTMLFormElement) {
    const formData = new FormData(form); // Creates a FormData object from the form
    const getValue = (field: keyof EditorValues) => {
      const value = formData.get(field); // reads one field by name, like "title"

      return value === null ? values[field] : String(value);
    };

    return { // returns all form values
      title: getValue("title"),
      category: getValue("category"),
      description: getValue("description"),
      content: getValue("content"),
      imageUrl: getValue("imageUrl"),
      tags: getValue("tags"),
    };
  }

  function validateAndShowErrors(nextValues: EditorValues) {
    const nextErrors = validate(nextValues); // runs validation from line 22
    const hasErrors = Object.keys(nextErrors).length > 0; // checks if any errors exist

    setValues(nextValues); 
    setErrors(nextErrors);
    setShowFormError(hasErrors);
    hadValidationErrorsRef.current = hasErrors;
// update state so errors show on screen
    return hasErrors;
  }

  function handleSave() {
    const form = formRef.current; // Gets the actual HTML form

    if (!form) {
      return;
    }

    const nextValues = getCurrentFormValues(form); // Reads the latest form values
    const hadValidationErrors = hadValidationErrorsRef.current;
    const hasErrors = validateAndShowErrors(nextValues); // Runs validation and shows errors if needed
    allowSubmitRef.current = false;

    if (hasErrors || hadValidationErrors || !saveAction) {
      return; // if invalid, stop and do not submit
    }

    allowSubmitRef.current = true; // allows one real submit
    form.requestSubmit(); // now the form submits
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (allowSubmitRef.current) {
      allowSubmitRef.current = false;
      return;
    }

    event.preventDefault();
    allowSubmitRef.current = false;
    validateAndShowErrors(getCurrentFormValues(event.currentTarget));
  }

  function openPreview() {
    if (contentRef.current) {
      selectionRef.current = {
        start: contentRef.current.selectionStart,
        end: contentRef.current.selectionEnd,
      };
    }

    setShowPreview(true);
  }

  function closePreview() {
    setShowPreview(false);
  }

  return (
    <main className={styles.editor}>
      <form
        action={saveAction}
        className={styles.editorCard}
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input
            className={styles.input}
            id="title"
            name="title"
            value={values.title}
            onChange={(event) => setFieldValue("title", event.target.value)}
          />
          {errors.title ? <p className={styles.error}>{errors.title}</p> : null}
        </div>

        {showCategory ? (
          <div className={styles.field}>
            <label htmlFor="category">Category</label>
            <input
              className={styles.input}
              id="category"
              name="category"
              value={values.category}
              onChange={(event) => setFieldValue("category", event.target.value)}
            />
          </div>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            className={styles.textarea}
            id="description"
            name="description"
            value={values.description}
            onChange={(event) =>
              setFieldValue("description", event.target.value)
            }
          />
          {errors.description ? <p className={styles.error}>{errors.description}</p> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="content">Content</label>
          {showPreview ? (
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              data-test-id="content-preview"
            />
          ) : (
            <textarea
              className={styles.textarea}
              id="content"
              name="content"
              ref={contentRef}
              value={values.content}
              onChange={(event) => setFieldValue("content", event.target.value)}
            />
          )}
          {errors.content ? <p className={styles.error}>{errors.content}</p> : null}
          <div className={styles.actions}>
            <button className={styles.button} type="button" onClick={showPreview ? closePreview : openPreview}>
              {showPreview ? "Close Preview" : "Preview"}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="image-url">Image URL</label>
          <input
            className={styles.input}
            id="image-url"
            name="imageUrl"
            value={values.imageUrl}
            onChange={(event) => setFieldValue("imageUrl", event.target.value)}
          />
          {errors.imageUrl ? <p className={styles.error}>{errors.imageUrl}</p> : null}
          <img
            alt="Image preview"
            className={styles.imagePreview}
            data-test-id="image-preview"
            src={imagePreviewSrc}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="tags">Tags</label>
          <input
            className={styles.input}
            id="tags"
            name="tags"
            value={values.tags}
            onChange={(event) => setFieldValue("tags", event.target.value)}
          />
          {errors.tags ? <p className={styles.error}>{errors.tags}</p> : null}
        </div>

        {successMessage ? <p>{successMessage}</p> : null}
        {showFormError ? <p className={styles.error}>Please fix the errors before saving</p> : null}
        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={handleSave}>
            Save
          </button>
          <button hidden type="submit">
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}
