import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, Button, Input, Modal } from '../Components/ui';

const ModalHarness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Publicar campanha?"
        description="A campanha fica visível para todos."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button>Publicar</Button>
          </>
        }
      >
        <Input label="Nome" />
      </Modal>
    </>
  );
};

describe('Modal', () => {
  it('traps the focus, closes with Esc and returns the focus to the opener', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const opener = screen.getByRole('button', { name: 'Abrir modal' });
    await user.click(opener);

    const dialog = await screen.findByRole('dialog', { name: 'Publicar campanha?' });
    expect(dialog).toHaveAccessibleDescription('A campanha fica visível para todos.');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    // Focus trap: tabbing through every control (and beyond) never leaves the dialog.
    for (let step = 0; step < 6; step += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
});

describe('Button', () => {
  it('sets aria-busy and disables itself while loading', () => {
    render(<Button loading>Salvar</Button>);
    const button = screen.getByRole('button', { name: /salvar/i });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('has no aria-busy when idle', () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).not.toHaveAttribute('aria-busy');
  });
});

describe('Input', () => {
  it('links the error with aria-invalid and aria-describedby', () => {
    render(<Input id="email" label="E-mail" hint="Vamos avisar por aqui." error="Informe um e-mail válido." />);
    const input = screen.getByLabelText('E-mail');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-hint email-error');
    expect(input).toHaveAccessibleDescription('Vamos avisar por aqui. Informe um e-mail válido.');
  });

  it('is not marked invalid without an error', () => {
    render(<Input label="Nome" />);
    const input = screen.getByLabelText('Nome');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

describe('Alert', () => {
  it('uses role="alert" for danger', () => {
    render(<Alert variant="danger" title="Não foi possível salvar">Tente de novo.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar');
  });

  it('uses role="status" with aria-live="polite" for the other variants', () => {
    render(<Alert variant="success" title="Campanha publicada" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
