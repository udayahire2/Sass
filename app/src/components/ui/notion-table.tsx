import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Eraser
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';

// Interfaces for Table Data Structure
export interface TableColumn {
  id: string;
  width: number;
  title?: string;
}

export interface TableRowData {
  id: string;
  cells: string[]; // Cell contents by column index
}

const GripIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-muted-foreground/50 hover:text-foreground/80 transition-colors">
    <circle cx="4" cy="3" r="1" fill="currentColor"/>
    <circle cx="4" cy="6" r="1" fill="currentColor"/>
    <circle cx="4" cy="9" r="1" fill="currentColor"/>
    <circle cx="8" cy="3" r="1" fill="currentColor"/>
    <circle cx="8" cy="6" r="1" fill="currentColor"/>
    <circle cx="8" cy="9" r="1" fill="currentColor"/>
  </svg>
);

interface NotionTableProps {
  data?: { columns: TableColumn[]; rows: TableRowData[] };
  className?: string;
  onChange?: (data: { columns: TableColumn[]; rows: TableRowData[] }) => void;
  editable?: boolean;
}

/**
 * Safe helper to parse and render formatted cell content including <strong>, <b>, <em>, <i>, <code>, <a>, <s>, <u> tags and markdown bold (**text**)
 */
function renderFormattedContent(content: string | undefined): React.ReactNode {
  if (!content) return null;

  let html = content;

  // Convert markdown bold and italic syntaxes to HTML tags if present
  if (html.includes('**') || html.includes('__')) {
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>');
  }
  if (html.includes('*') || html.includes('_')) {
    html = html
      .replace(/(^|[^\*])\*(?!\*)(.*?)\*/g, '$1<em>$2</em>')
      .replace(/(^|[^_])_(?!_)(.*?)_/g, '$1<em>$2</em>');
  }

  // Fast path: if no HTML tags are present, return string as-is
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
    return convertDomToReactNodes(doc.body);
  } catch {
    return content;
  }
}

function convertDomToReactNodes(node: Node, keyPrefix = 'node'): React.ReactNode {
  const nodes = Array.from(node.childNodes);
  if (nodes.length === 0) return null;

  return nodes.map((child, index) => {
    const key = `${keyPrefix}-${index}`;
    if (child.nodeType === Node.TEXT_NODE) {
      return child.nodeValue;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const children = convertDomToReactNodes(el, key);

      switch (tagName) {
        case 'strong':
        case 'b':
          return <strong key={key} className="font-bold text-foreground">{children}</strong>;
        case 'em':
        case 'i':
          return <em key={key} className="italic">{children}</em>;
        case 'code':
          return <code key={key} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>;
        case 's':
        case 'strike':
        case 'del':
          return <s key={key} className="line-through">{children}</s>;
        case 'u':
          return <u key={key} className="underline">{children}</u>;
        case 'mark':
          return <mark key={key} className="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded">{children}</mark>;
        case 'a': {
          const href = el.getAttribute('href') || '#';
          return (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {children}
            </a>
          );
        }
        case 'br':
          return <br key={key} />;
        case 'p':
        case 'span':
        case 'div':
        default:
          return <span key={key}>{children}</span>;
      }
    }
    return null;
  });
}

export function NotionTable({
  data,
  className,
  onChange,
  editable = true,
}: NotionTableProps) {
  // ── State Management ──
  const [columns, setColumns] = useState<TableColumn[]>(() => {
    if (data?.columns && data.columns.length > 0) {
      return data.columns.map((col, i) => ({
        ...col,
        title: col.title !== undefined ? col.title : (i === 0 ? "Name" : `Column ${i}`)
      }));
    }
    return Array.from({ length: 3 }).map((_, i) => ({
      id: `col-${Math.random().toString(36).substr(2, 9)}`,
      width: 180,
      title: i === 0 ? "Name" : `Column ${i}`,
    }));
  });

  const [rows, setRows] = useState<TableRowData[]>(() => {
    if (data?.rows && data.rows.length > 0) return data.rows;
    return Array.from({ length: 4 }).map((_, i) => ({
      id: `row-${Math.random().toString(36).substr(2, 9)}`,
      cells: Array(3).fill(''),
    }));
  });

  // Sync state with dynamic external data prop changes
  useEffect(() => {
    if (data?.columns && data.columns.length > 0) {
      const newColumns = data.columns.map((col, i) => ({
        ...col,
        title: col.title !== undefined ? col.title : (i === 0 ? "Name" : `Column ${i}`)
      }));
      setColumns(prev => JSON.stringify(prev) !== JSON.stringify(newColumns) ? newColumns : prev);
    }
  }, [data?.columns]);

  useEffect(() => {
    if (data?.rows && data.rows.length > 0) {
      setRows(prev => JSON.stringify(prev) !== JSON.stringify(data.rows) ? data.rows : prev);
    }
  }, [data?.rows]);

  // Focus & Edit Selection coordinates (rowIndex can be -1 for header row)
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  
  // Custom Selection Highlights (when top or left pill is clicked)
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Hover states for Column/Row cells and Column/Row handle selection
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [hoveredColHandleIndex, setHoveredColHandleIndex] = useState<number | null>(null);
  const [hoveredRowHandleIndex, setHoveredRowHandleIndex] = useState<number | null>(null);

  // Custom Floating Popover State (directly attached to grabbed pills)
  const [activeMenu, setActiveMenu] = useState<{
    type: 'col' | 'row';
    index: number;
  } | null>(null);

  // Toggle for showing structural layout controls
  const [isHovered, setIsHovered] = useState(false);
  const showControls = isHovered || focusedCell !== null || activeMenu !== null;

  // Global Table Width state
  const [tableWidth, setTableWidth] = useState<number | string>('100%');

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  // Trigger onChange updates
  useEffect(() => {
    if (columns.length > 0 && rows.length > 0 && onChange) {
      onChange({ columns, rows });
    }
  }, [columns, rows, onChange]);

  // ── Focus Ref on Textarea mounting ──
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      const val = editInputRef.current.value;
      editInputRef.current.value = '';
      editInputRef.current.value = val;
    }
  }, [editingCell]);

  // Click Outside to Save & Close Selections/Menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditingCell(null);
        setFocusedCell(null);
        setSelectedColIndex(null);
        setSelectedRowIndex(null);
        setActiveMenu(null);
        setHoveredColHandleIndex(null);
        setHoveredRowHandleIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // ── Column Resizing Logic ──
  const handleResizeMouseDown = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columns[colIndex].width;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX);
      setColumns(prev => prev.map((col, idx) => idx === colIndex ? { ...col, width: newWidth } : col));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ── Global Table Resize Handle ──
  const handleTableResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = containerRef.current?.getBoundingClientRect().width || 600;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(300, startWidth + deltaX);
      setTableWidth(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ── Cell Focus & Click Operations ──
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!editable) return;
    setFocusedCell({ rowIndex, colIndex });
    setEditingCell({ rowIndex, colIndex });
    setSelectedColIndex(null);
    setSelectedRowIndex(null);
    setActiveMenu(null);

    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    if (rowIndex === -1) {
      setColumns(prev => prev.map((col, idx) => idx === colIndex ? { ...col, title: val } : col));
    } else {
      setRows(prev => prev.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          const newCells = [...row.cells];
          newCells[colIndex] = val;
          return { ...row, cells: newCells };
        }
        return row;
      }));
    }
  };

  // ── Keyboard Navigation (VS Code / Notion Style with Header Support) ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusedCell) return;
    const { rowIndex, colIndex } = focusedCell;

    // If active editing mode
    if (editingCell) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditingCell(null);
        return;
      }
      if (e.key === 'Tab') {
        // Fall through to let Tab navigate
        setEditingCell(null);
      } else {
        // Let native textarea handle Enter (newline) and Arrows
        e.stopPropagation();
        return;
      }
    } 

    // Navigation Mode keyboard triggers
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (rowIndex > -1) setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (rowIndex < rows.length - 1) setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (colIndex > 0) setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (colIndex < columns.length - 1) setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          if (colIndex > 0) {
            setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
          } else if (rowIndex > -1) {
            setFocusedCell({ rowIndex: rowIndex - 1, colIndex: columns.length - 1 });
          }
        } else {
          if (colIndex < columns.length - 1) {
            setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
          } else if (rowIndex < rows.length - 1) {
            setFocusedCell({ rowIndex: rowIndex + 1, colIndex: 0 });
          } else {
            handleAddRowBelow(rows.length - 1);
            setFocusedCell({ rowIndex: rows.length, colIndex: 0 });
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        setEditingCell({ rowIndex, colIndex });
        break;
      case 'Backspace':
      case 'Delete':
        e.preventDefault();
        handleCellChange(rowIndex, colIndex, '');
        break;
      default:
        break;
    }
  };

  // ── Row & Column Mutation Commands ──
  const handleAddRowAbove = (index: number) => {
    const newRow: TableRowData = {
      id: `row-${Math.random().toString(36).substr(2, 9)}`,
      cells: Array(columns.length).fill(''),
    };
    setRows(prev => {
      const copy = [...prev];
      copy.splice(index, 0, newRow);
      return copy;
    });
    closePopups();
  };

  const handleAddRowBelow = (index: number) => {
    const newRow: TableRowData = {
      id: `row-${Math.random().toString(36).substr(2, 9)}`,
      cells: Array(columns.length).fill(''),
    };
    setRows(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newRow);
      return copy;
    });
    closePopups();
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, i) => i !== index));
    closePopups();
  };

  const handleClearRow = (index: number) => {
    setRows(prev => prev.map((row, rIdx) => {
      if (rIdx === index) {
        return { ...row, cells: Array(columns.length).fill('') };
      }
      return row;
    }));
    closePopups();
  };

  const handleAddColLeft = (index: number) => {
    const newCol: TableColumn = {
      id: `col-${Math.random().toString(36).substr(2, 9)}`,
      width: 150,
      title: `Column ${columns.length}`
    };
    setColumns(prev => {
      const copy = [...prev];
      copy.splice(index, 0, newCol);
      return copy;
    });
    setRows(prev => prev.map(row => {
      const cellsCopy = [...row.cells];
      cellsCopy.splice(index, 0, '');
      return { ...row, cells: cellsCopy };
    }));
    closePopups();
  };

  const handleAddColRight = (index: number) => {
    const newCol: TableColumn = {
      id: `col-${Math.random().toString(36).substr(2, 9)}`,
      width: 150,
      title: `Column ${columns.length}`
    };
    setColumns(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, newCol);
      return copy;
    });
    setRows(prev => prev.map(row => {
      const cellsCopy = [...row.cells];
      cellsCopy.splice(index + 1, 0, '');
      return { ...row, cells: cellsCopy };
    }));
    closePopups();
  };

  const handleDeleteCol = (index: number) => {
    if (columns.length <= 1) return;
    setColumns(prev => prev.filter((_, i) => i !== index));
    setRows(prev => prev.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== index),
    })));
    closePopups();
  };

  const handleClearCol = (index: number) => {
    setRows(prev => prev.map(row => {
      const cellsCopy = [...row.cells];
      cellsCopy[index] = '';
      return { ...row, cells: cellsCopy };
    }));
    closePopups();
  };

  const closePopups = () => {
    setFocusedCell(null);
    setEditingCell(null);
    setSelectedColIndex(null);
    setSelectedRowIndex(null);
    setActiveMenu(null);
    setHoveredColHandleIndex(null);
    setHoveredRowHandleIndex(null);
  };

  // ── Grab Pill Selection Click Handlers ──
  const handleColumnPillClick = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColIndex(colIndex);
    setSelectedRowIndex(null);
    setActiveMenu({ type: 'col', index: colIndex });
  };

  const handleRowPillClick = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedRowIndex(rowIndex);
    setSelectedColIndex(null);
    setActiveMenu({ type: 'row', index: rowIndex });
  };

  return (
    <div 
      ref={containerRef}
      className={cn("w-full relative group/table-container my-3", className)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      style={{ width: tableWidth }}
    >
      <Table 
        onMouseLeave={() => { setHoveredColIndex(null); setHoveredRowIndex(null); }}
      >
        <colgroup>
          {columns.map((col) => (
            <col key={col.id} style={{ width: col.width }} />
          ))}
        </colgroup>

        {/* Header Row */}
        <TableHeader>
          <TableRow>
              {columns.map((col, colIndex) => {
                const isFocused = focusedCell?.rowIndex === -1 && focusedCell?.colIndex === colIndex;
                const isEditing = editingCell?.rowIndex === -1 && editingCell?.colIndex === colIndex;
                
                return (
                  <TableHead
                    key={col.id}
                    className="relative cursor-text"
                    onClick={() => handleCellClick(-1, colIndex)}
                    onMouseEnter={() => setHoveredColIndex(colIndex)}
                  >
                    <div className="flex items-center justify-between h-full relative">
                      {isEditing ? (
                        <textarea
                          ref={editInputRef}
                          value={col.title ?? ''}
                          onChange={(e) => handleCellChange(-1, colIndex, e.target.value)}
                          onBlur={(e) => {
                            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full min-h-[1.5rem] resize-none bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none p-0 m-0 text-sm font-semibold text-foreground block whitespace-pre-wrap select-text leading-relaxed overflow-hidden"
                          placeholder="..."
                          rows={1}
                        />
                      ) : (
                        <div className="w-full min-h-[1.5rem] p-0 m-0 font-semibold text-foreground whitespace-pre-wrap block leading-relaxed overflow-hidden break-words">
                          {renderFormattedContent(col.title)}
                        </div>
                      )}
                    </div>

                    {/* Column Border Drag Resizer */}
                    {editable && (
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, colIndex)}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary z-20 transition-colors"
                        title="Drag to resize column"
                      />
                    )}

                    {/* FOCUSED CELL BLUE OUTLINE */}
                    {isFocused && !isEditing && (
                      <div className="absolute inset-0 border border-primary z-30 pointer-events-none" />
                    )}

                    {/* Column Grip Handle */}
                    {showControls && (hoveredColIndex === colIndex || selectedColIndex === colIndex) && (
                      <button
                        onClick={(e) => handleColumnPillClick(e, colIndex)}
                        onMouseEnter={() => setHoveredColHandleIndex(colIndex)}
                        onMouseLeave={() => setHoveredColHandleIndex(null)}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 w-6 h-4.5 bg-popover border border-border hover:bg-accent rounded flex items-center justify-center shadow-xs cursor-pointer transition-all duration-100"
                        title="Select Column"
                      >
                        <GripIcon />
                      </button>
                    )}

                    {/* COLUMN CONTEXT POPOVER MENU */}
                    {activeMenu?.type === 'col' && activeMenu.index === colIndex && (
                      <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-md border border-border rounded-none p-1 shadow-md w-44 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-100 select-none">
                        <PopoverItem 
                          icon={ArrowLeft} 
                          label="Insert Left" 
                          onClick={() => handleAddColLeft(colIndex)} 
                        />
                        <PopoverItem 
                          icon={ArrowRight} 
                          label="Insert Right" 
                          onClick={() => handleAddColRight(colIndex)} 
                        />
                        <div className="h-px bg-border my-1 mx-1" />
                        <PopoverItem 
                          icon={Eraser} 
                          label="Clear Column" 
                          onClick={() => handleClearCol(colIndex)} 
                        />
                        <PopoverItem 
                          icon={Trash2} 
                          label="Delete Column" 
                          onClick={() => handleDeleteCol(colIndex)} 
                          destructive
                        />
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

        {/* Table Data Rows */}
        <TableBody>
            {rows.map((row, rowIndex) => {
              return (
                <TableRow
                  key={row.id}
                  onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                >
                  {row.cells.map((cellText, colIndex) => {
                    const isFocused = focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;

                    return (
                      <TableCell
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onMouseEnter={() => setHoveredColIndex(colIndex)}
                        className="relative align-top cursor-text break-words"
                      >
                        {isEditing ? (
                          <textarea
                            ref={editInputRef}
                            value={cellText ?? ''}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onBlur={(e) => {
                              if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                                setEditingCell(null);
                              }
                            }}
                            className="w-full min-h-[1.5rem] h-full resize-none bg-transparent border-none outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none p-0 m-0 text-sm font-sans text-foreground block whitespace-pre-wrap select-text leading-relaxed overflow-hidden"
                            placeholder=""
                            rows={1}
                          />
                        ) : (
                          <div className="w-full min-h-[1.5rem] p-0 m-0 text-sm break-words leading-relaxed whitespace-pre-wrap font-sans">
                            {cellText ? renderFormattedContent(cellText) : <span className="opacity-0">.</span>}
                          </div>
                        )}

                        {/* FOCUSED CELL BLUE OUTLINE */}
                        {isFocused && !isEditing && (
                          <div className="absolute inset-0 border border-primary z-30 pointer-events-none" />
                        )}

                        {/* Row Grip Handle */}
                        {showControls && colIndex === 0 && (hoveredRowIndex === rowIndex || selectedRowIndex === rowIndex) && (
                          <button
                            onClick={(e) => handleRowPillClick(e, rowIndex)}
                            onMouseEnter={() => setHoveredRowHandleIndex(rowIndex)}
                            onMouseLeave={() => setHoveredRowHandleIndex(null)}
                            className="absolute top-1/2 -translate-y-1/2 -left-7 z-40 w-4.5 h-6 bg-popover border border-border hover:bg-accent rounded flex items-center justify-center shadow-xs cursor-pointer transition-all duration-100"
                            title="Select Row"
                          >
                            <GripIcon />
                          </button>
                        )}

                        {/* ROW CONTEXT POPOVER MENU */}
                        {activeMenu?.type === 'row' && activeMenu.index === rowIndex && colIndex === 0 && (
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-popover/95 backdrop-blur-md border border-border rounded-none p-1 shadow-md w-44 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-left-1 duration-100 select-none">
                            <PopoverItem 
                              icon={ArrowUp} 
                              label="Insert Row Above" 
                              onClick={() => handleAddRowAbove(rowIndex)} 
                            />
                            <PopoverItem 
                              icon={ArrowDown} 
                              label="Insert Row Below" 
                              onClick={() => handleAddRowBelow(rowIndex)} 
                            />
                            <div className="h-px bg-border my-1 mx-1" />
                            <PopoverItem 
                              icon={Eraser} 
                              label="Clear Row" 
                              onClick={() => handleClearRow(rowIndex)} 
                            />
                            <PopoverItem 
                              icon={Trash2} 
                              label="Delete Row" 
                              onClick={() => handleDeleteRow(rowIndex)} 
                              destructive
                            />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Global Bottom-Right Table Resize Handle */}
        {editable && (
          <div
            onMouseDown={handleTableResizeMouseDown}
            className="absolute bottom-2 right-2 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-40 text-muted-foreground/40 hover:text-primary opacity-0 group-hover/table-container:opacity-100 transition-opacity duration-200"
            title="Drag to resize table width"
          >
            <svg width="6" height="6" viewBox="0 0 6 6" className="fill-current">
              <path d="M5 0h1v1H5V0zm-2 2h1v1H3V2zm2 0h1v1H5V2zM1 4h1v1H1V4zm2 0h1v1H3V4zm2 0h1v1H5V4z" />
            </svg>
          </div>
        )}

      {/* Add Column hover button on the right edge */}
      {editable && showControls && (
        <div 
          className="absolute top-[28px] bottom-[28px] -right-[14px] w-[28px] flex items-center justify-center opacity-0 group-hover/table-container:opacity-100 transition-opacity duration-200 z-50"
          contentEditable={false}
        >
          <div className="relative group/add-col-tooltip">
            <button
              onClick={() => handleAddColRight(columns.length - 1)}
              className="w-5 h-5 rounded hover:bg-accent hover:text-foreground text-muted-foreground/45 bg-popover border border-border shadow-sm flex items-center justify-center cursor-pointer transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] font-sans px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none opacity-0 scale-95 group-hover/add-col-tooltip:opacity-100 group-hover/add-col-tooltip:scale-100 transition-all duration-150 z-50">
              Add column to the right
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
            </div>
          </div>
        </div>
      )}

      {/* Add Row hover button at the bottom edge */}
      {editable && showControls && (
        <div 
          className="absolute left-[28px] right-[28px] -bottom-[14px] h-[28px] flex items-center justify-center opacity-0 group-hover/table-container:opacity-100 transition-opacity duration-200 z-50"
          contentEditable={false}
        >
          <div className="relative group/add-row-tooltip">
            <button
              onClick={() => handleAddRowBelow(rows.length - 1)}
              className="w-5 h-5 rounded hover:bg-accent hover:text-foreground text-muted-foreground/45 bg-popover border border-border shadow-sm flex items-center justify-center cursor-pointer transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[11px] font-sans px-2.5 py-1 rounded shadow-md whitespace-nowrap pointer-events-none opacity-0 scale-95 group-hover/add-row-tooltip:opacity-100 group-hover/add-row-tooltip:scale-100 transition-all duration-150 z-50">
              Add row
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#1a1a1a]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable context popover item
function PopoverItem({
  icon: Icon,
  label,
  onClick,
  destructive = false
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 w-full text-left text-xs font-sans rounded-none cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive"
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
