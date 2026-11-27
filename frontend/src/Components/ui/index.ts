// Viralt design system base components ("Bilhete Premiado", docs/design/components.md).
export { cn, focusRing, describedBy, textLinkClasses } from './cn';

export { Button, buttonClasses } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Field, FieldLabel, FieldHint, FieldError, controlClasses, useFieldIds } from './Field';
export type { FieldProps, FieldIds } from './Field';

export { Input } from './Input';
export type { InputProps, InputVariant } from './Input';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Checkbox } from './Checkbox';
export type { CheckboxProps, ChoiceVariant } from './Checkbox';

export { Radio, RadioGroup } from './Radio';
export type { RadioProps, RadioGroupProps } from './Radio';

export { FileInput } from './FileInput';
export type { FileInputProps } from './FileInput';

export { ColorInput, contrastRatio } from './ColorInput';
export type { ColorInputProps } from './ColorInput';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export type { CardProps, CardVariant } from './Card';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';

export { Skeleton, SkeletonText, SkeletonTitle, SkeletonAvatar, SkeletonCard, SkeletonGroup } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Modal, ModalClose } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

export { ConfirmModal, ConfirmProvider, useConfirm } from './ConfirmModal';
export type { ConfirmModalProps, ConfirmOptions, ConfirmTone, ConfirmFn } from './ConfirmModal';

export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';

export { Toaster } from './Toaster';
export type { ToasterProps } from './Toaster';

export { Table } from './Table';
export type { TableProps, TableColumn, TableSort, SortDirection } from './Table';

export { Pagination, getPageItems } from './Pagination';
export type { PaginationProps, PaginationLabels } from './Pagination';

export { Tabs } from './Tabs';
export type { TabsProps, TabItem, TabsOrientation, TabStatus } from './Tabs';

export { DropdownMenu } from './DropdownMenu';
export type { DropdownMenuProps, DropdownMenuItem } from './DropdownMenu';

export { Avatar, getInitials } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { PageContainer, PageHeader } from './PageContainer';
export type { PageContainerProps, PageHeaderProps, PageContainerVariant } from './PageContainer';
