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

interface NotionTableProps {
  data?: { columns: TableColumn[]; rows: TableRowData[] };
  className?: string;
  onChange?: (data: { columns: TableColumn[]; rows: TableRowData[] }) => void;
}

export function NotionTable({
  data,
  className,
  onChange,
}: NotionTableProps) {
  // ── State Management ──
  const [columns, setColumns] = useState<TableColumn[]>(() => {
    if (data?.columns && data.columns.length > 0) {
      return data.columns.map((col, i) => ({
        ...col,
        title: col.title || (i === 0 ? "Name" : `Column ${i}`)
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
      setColumns(data.columns.map((col, i) => ({
        ...col,
        title: col.title || (i === 0 ? "Name" : `Column ${i}`)
      })));
    }
  }, [data?.columns]);

  useEffect(() => {
    if (data?.rows && data.rows.length > 0) {
      setRows(data.rows);
    }
  }, [data?.rows]);

  // Focus & Edit Selection coordinates (rowIndex can be -1 for header row)
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  
  // Custom Selection Highlights (when top or left pill is clicked)
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Custom Floating Popover State (directly attached to grabbed pills)
  const [activeMenu, setActiveMenu] = useState<{
    type: 'col' | 'row';
    index: number;
  } | null>(null);

  // Global Table Width state
  const [tableWidth, setTableWidth] = useState<number | string>('100%');

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setFocusedCell({ rowIndex, colIndex });
    setSelectedColIndex(null);
    setSelectedRowIndex(null);
    setActiveMenu(null);
  };

  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    setFocusedCell({ rowIndex, colIndex });
    setEditingCell({ rowIndex, colIndex });
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
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        setEditingCell(null);
        if (rowIndex < rows.length - 1) {
          setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditingCell(null);
      }
      return;
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
      className={cn("relative select-none font-sans text-sm text-foreground my-3 group/table-container max-w-full", className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ width: tableWidth }}
    >
      <div className="relative w-full overflow-x-auto pr-2 bg-transparent">
        <Table className="table-fixed select-text border border-border bg-transparent rounded-none">
          <colgroup>
            {columns.map((col) => (
              <col key={col.id} style={{ width: col.width }} />
            ))}
          </colgroup>

          {/* Header Row */}
          <TableHeader className="bg-transparent border-b border-border rounded-none">
            <TableRow className="border-b border-border h-10 bg-transparent hover:bg-transparent rounded-none">
              {columns.map((col, colIndex) => {
                const isFocused = focusedCell?.rowIndex === -1 && focusedCell?.colIndex === colIndex;
                const isEditing = editingCell?.rowIndex === -1 && editingCell?.colIndex === colIndex;
                const isColSelected = selectedColIndex === colIndex;

                return (
                  <TableHead
                    key={col.id}
                    className={cn(
                      "relative border-r border-border p-0 text-left font-medium select-none h-10 transition-all duration-150 last:border-r-0 bg-transparent text-muted-foreground rounded-none",
                      isColSelected && "bg-accent/40 dark:bg-accent/30"
                    )}
                    onClick={() => handleCellClick(-1, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(-1, colIndex)}
                  >
                    <div className="flex items-center justify-between px-3.5 h-full relative">
                      {isEditing ? (
                        <textarea
                          ref={editInputRef}
                          value={col.title || ''}
                          onChange={(e) => handleCellChange(-1, colIndex, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          className="w-full resize-none bg-transparent border-none outline-none focus:ring-0 p-0 text-xs tracking-wide font-medium text-muted-foreground block whitespace-pre-wrap select-text h-5"
                          placeholder="..."
                        />
                      ) : (
                        <span className="text-xs tracking-wide font-medium text-muted-foreground font-sans">
                          {col.title}
                        </span>
                      )}
                    </div>

                    {/* Column Border Drag Resizer */}
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, colIndex)}
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary z-20 transition-colors"
                      title="Drag to resize column"
                    />

                    {/* FOCUSED CELL BLUE OUTLINE & FLOATING PILLS */}
                    {isFocused && (
                      <>
                        {/* Thin Solid Primary Active Cell Border */}
                        <div className="absolute inset-0 border border-primary z-30 pointer-events-none" />

                        {/* Top Grab Pill (—) */}
                        <button
                          onClick={(e) => handleColumnPillClick(e, colIndex)}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 z-40 w-7 h-3.5 bg-popover border border-border hover:bg-accent hover:text-accent-foreground text-muted-foreground rounded-none flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95 group/pill"
                          title="Select Column"
                        >
                          <div className="w-3 h-0.5 bg-muted-foreground/50 rounded-none group-hover/pill:bg-accent-foreground transition-colors" />
                        </button>

                        {/* Left Grab Pill (|) */}
                        <button
                          onClick={(e) => handleRowPillClick(e, 0)} // Header click rows menu row 0
                          className="absolute top-1/2 -translate-y-1/2 -left-2 z-40 w-3.5 h-7 bg-popover border border-border hover:bg-accent hover:text-accent-foreground text-muted-foreground rounded-none flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95 group/pill"
                          title="Select Row"
                        >
                          <div className="w-0.5 h-3 bg-muted-foreground/50 rounded-none group-hover/pill:bg-accent-foreground transition-colors" />
                        </button>
                      </>
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
          <TableBody className="bg-transparent rounded-none">
            {rows.map((row, rowIndex) => {
              const isRowSelected = selectedRowIndex === rowIndex;

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/30 transition-colors duration-100 last:border-b-0 bg-transparent rounded-none",
                    isRowSelected && "bg-accent/50 dark:bg-accent/40"
                  )}
                >
                  {row.cells.map((cellText, colIndex) => {
                    const isFocused = focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;
                    const isColSelected = selectedColIndex === colIndex;

                    return (
                      <TableCell
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                        className={cn(
                          "relative border-r border-border p-2.5 h-10 align-top select-text whitespace-pre-wrap outline-none font-sans text-sm transition-all text-foreground break-words last:border-r-0 bg-transparent rounded-none",
                          isColSelected && "bg-accent/40 dark:bg-accent/30",
                          isEditing && "p-1.5"
                        )}
                      >
                        {isEditing ? (
                          <textarea
                            ref={editInputRef}
                            value={cellText}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="w-full min-h-[2.25rem] h-full resize-none bg-transparent border-none outline-none focus:ring-0 p-1 text-sm font-sans text-foreground block whitespace-pre-wrap select-text"
                            placeholder=""
                          />
                        ) : (
                          <div className="w-full min-h-[1.15rem] text-sm break-words leading-relaxed">
                            {cellText || <span className="opacity-0">.</span>}
                          </div>
                        )}

                        {/* FOCUSED CELL BLUE OUTLINE & FLOATING PILLS */}
                        {isFocused && (
                          <>
                            {/* Thin Solid Primary Active Cell Border */}
                            <div className="absolute inset-0 border border-primary z-30 pointer-events-none" />

                            {/* Top Grab Pill (—) */}
                            <button
                              onClick={(e) => handleColumnPillClick(e, colIndex)}
                              className="absolute -top-2 left-1/2 -translate-x-1/2 z-40 w-7 h-3.5 bg-popover border border-border hover:bg-accent hover:text-accent-foreground text-muted-foreground rounded-none flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95 group/pill"
                              title="Select Column"
                            >
                              <div className="w-3 h-0.5 bg-muted-foreground/50 rounded-none group-hover/pill:bg-accent-foreground transition-colors" />
                            </button>

                            {/* Left Grab Pill (|) */}
                            <button
                              onClick={(e) => handleRowPillClick(e, rowIndex)}
                              className="absolute top-1/2 -translate-y-1/2 -left-2 z-40 w-3.5 h-7 bg-popover border border-border hover:bg-accent hover:text-accent-foreground text-muted-foreground rounded-none flex items-center justify-center shadow-sm cursor-pointer transition-all active:scale-95 group/pill"
                              title="Select Row"
                            >
                              <div className="w-0.5 h-3 bg-muted-foreground/50 rounded-none group-hover/pill:bg-accent-foreground transition-colors" />
                            </button>
                          </>
                        )}

                        {/* ROW CONTEXT POPOVER MENU */}
                        {activeMenu?.type === 'row' && activeMenu.index === rowIndex && isFocused && (
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
        <div
          onMouseDown={handleTableResizeMouseDown}
          className="absolute bottom-0.5 right-0.5 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-40 text-muted-foreground/40 hover:text-primary opacity-0 group-hover/table-container:opacity-100 transition-opacity duration-200"
          title="Drag to resize table width"
        >
          <svg width="6" height="6" viewBox="0 0 6 6" className="fill-current">
            <path d="M5 0h1v1H5V0zm-2 2h1v1H3V2zm2 0h1v1H5V2zM1 4h1v1H1V4zm2 0h1v1H3V4zm2 0h1v1H5V4z" />
          </svg>
        </div>
      </div>

      {/* Sleek Add Buttons below the table */}
      <div className="flex items-center gap-2.5 mt-2.5 px-0.5 select-none" contentEditable={false}>
        <button
          onClick={() => handleAddRowBelow(rows.length - 1)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 px-2 py-1 cursor-pointer hover:bg-accent rounded-none font-sans font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Row
        </button>
        <button
          onClick={() => handleAddColRight(columns.length - 1)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors bg-transparent border-0 px-2 py-1 cursor-pointer hover:bg-accent rounded-none font-sans font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Column
        </button>
      </div>
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
