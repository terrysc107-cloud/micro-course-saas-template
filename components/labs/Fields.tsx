"use client";
import { useId } from "react";
import type { Answers, Field } from "@/lib/labs/intake";
export default function Fields({
  fields,
  answers,
  onChange,
  errors = {},
}: {
  fields: Field[];
  answers: Answers;
  onChange: (key: string, value: string) => void;
  errors?: Record<string, string>;
}) {
  const prefix = useId();
  return (
    <>
      {fields.map((field) => {
        const id = `${prefix}-${field.key}`;
        const shared = {
          id,
          value: answers[field.key] ?? "",
          onChange: (
            e: React.ChangeEvent<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
          ) => onChange(field.key, e.target.value),
          "aria-invalid": !!errors[field.key],
          "aria-describedby": `${id}-help`,
          required: field.required,
        };
        return (
          <div
            className={`lab-field ${field.type === "textarea" ? "wide" : ""}`}
            key={field.key}
          >
            <label htmlFor={id}>
              {field.label}
              {!field.required && !field.label.includes("optional") && (
                <span className="lab-small"> (optional)</span>
              )}
            </label>
            {field.options ? (
              <select {...shared}>
                <option value="">Select an answer</option>
                {field.options.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea {...shared} maxLength={field.max ?? 2000} rows={4} />
            ) : (
              <input
                {...shared}
                type={field.type === "url" ? "url" : "text"}
                maxLength={field.max ?? 500}
              />
            )}
            <p
              id={`${id}-help`}
              className="lab-small"
              style={errors[field.key] ? { color: "#a22418" } : {}}
            >
              {errors[field.key] || field.hint}
            </p>
          </div>
        );
      })}
    </>
  );
}
