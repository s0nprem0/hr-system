import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				outline:
					'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-(--btn-height-default) px-(--space-4) py-(--space-2)',
				sm: 'h-(--btn-height-sm) rounded-md px-(--space-3) text-xs',
				lg: 'h-(--btn-height-lg) rounded-md px-(--space-5)',
				icon: 'h-(--btn-height-default) w-(--btn-height-default)',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

export default buttonVariants
