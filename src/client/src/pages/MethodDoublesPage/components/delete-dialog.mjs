import { Dialog, DialogContent } from "@beeline/design-system-react";

export function DeleteMethodDialog({ method, open, setOpen }) {
    return <Dialog open={open}>
        <DialogContent title={`Удаление метода ${method.name}`} actions={{
            confirm: { label: "Удалить метод", onClick: () => setOpen?.(false) },
            cancel: { onClick: () => setOpen?.(false) }
        }}></DialogContent>
    </Dialog>
}