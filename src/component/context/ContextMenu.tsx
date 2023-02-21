import './ContextMenu.css';

export default function ContextMenu({ top, left, children }: { top: number, left: number, children: any }) {
  return (
    <div className="contect-menu" style={{ top, left }}>
      {children}
    </div>
  )

}