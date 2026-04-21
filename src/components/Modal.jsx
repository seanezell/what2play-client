/**
 * Full-screen dimmed overlay for modal content. Default centers content;
 * use align="start" for tall scrollable panels (e.g. group detail).
 */
export default function Modal({ children, align = 'center', className = '' }) {
  const alignClasses =
    align === 'start'
      ? 'items-start justify-center p-4 overflow-y-auto'
      : 'items-center justify-center';

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex z-50 ${alignClasses} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
