import * as React from 'react'
import {
	Dialog as Root,
	DialogPortal,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	DialogClose,
} from './Dialog'

interface DialogWrapperProps {
	isOpen: boolean
	onClose: () => void
	title?: React.ReactNode
	children?: React.ReactNode
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({
	isOpen,
	onClose,
	title,
	children,
}) => {
	return (
		<Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogPortal>
				<DialogOverlay />
				<DialogContent>
					{title ? <DialogTitle>{title}</DialogTitle> : null}
					<div className="mt-2">{children}</div>
					<DialogClose className="sr-only">Close</DialogClose>
				</DialogContent>
			</DialogPortal>
		</Root>
	)
}

export default DialogWrapper
