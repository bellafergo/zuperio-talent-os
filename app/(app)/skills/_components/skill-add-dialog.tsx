"use client";

import { PlusIcon } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSkill } from "@/lib/skills/actions";
import { SKILL_CATEGORIES } from "@/lib/skills/constants";

export function SkillAddDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createSkill, null);

  // Close and reset when the action succeeds
  useEffect(() => {
    if (state?.ok === true) {
      setOpen(false);
      setCategory("");
      formRef.current?.reset();
    }
  }, [state]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCategory("");
      formRef.current?.reset();
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="mr-1.5 size-4" aria-hidden />
        Agregar skill
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar skill al catálogo</DialogTitle>
          </DialogHeader>

          <form ref={formRef} action={action} className="space-y-4">
            {/* Hidden input so FormData receives the Select value */}
            <input type="hidden" name="category" value={category} />

            <div className="space-y-1.5">
              <label htmlFor="skill-name" className="text-sm font-medium">
                Nombre *
              </label>
              <Input
                id="skill-name"
                name="name"
                placeholder="Ej. React, PostgreSQL, Scrum…"
                autoComplete="off"
                maxLength={200}
              />
              {state?.ok === false && state.fieldErrors?.name ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="skill-category" className="text-sm font-medium">
                Categoría
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="skill-category">
                  <SelectValue placeholder="Selecciona una categoría…" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state?.ok === false && !state.fieldErrors && state.message ? (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
