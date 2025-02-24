"use client";

import React, { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { teachersDelete, studentsDelete, parentsDelete } from "@/app/_services/deleteApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AGgrid = ({
  columns,
  data,
  list
}: {
  columns: { header: string; accessor: string; className?: string }[];
  data: any[];
  list: string;
}) => {
  const router = useRouter();

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deleteTimeout, setDeleteTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sort data alphabetically by 'name' and assign roll numbers
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name
      .map((item, index) => ({
        ...item,
        rollNumber: index + 1, // Assign roll number starting from 1
      }));
  }, [data]);

  // Handle delete button click
  const handleDeleteClick = (Id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click event
    setPendingDelete(Id);
    setIsDeleteDialogOpen(true);
  };

  
  // Start deletion countdown
  // Define a mapping of list types to their delete functions
const deleteFunctions: { [key: string]: (id: string) => Promise<any> } = {
  teachers: teachersDelete,
  students: studentsDelete,
  parents: parentsDelete,
};

const confirmDelete = () => {
  if (!pendingDelete) return;

  setCountdown(5); // Start countdown from 5 seconds

  const interval = setInterval(() => {
    setCountdown((prev) => (prev !== null ? prev - 1 : null));
  }, 1000);

  const timeout = setTimeout(async () => {
    clearInterval(interval);

    // Get the delete function dynamically based on the list type
    const deleteFunction = deleteFunctions[list];

    if (!deleteFunction) {
      toast.error("Invalid deletion type!", { position: "top-right" });
      return;
    }

    console.log(`Deleting ${list} with ID: ${pendingDelete}`);

    const res = await deleteFunction(pendingDelete);

    if (res.success) {
      toast.success(res.message, { position: "top-right" });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast.error(res.message, { position: "top-right" });
    }

    // Reset states
    setPendingDelete(null);
    setCountdown(null);
    setIsDeleteDialogOpen(false);
  }, 5000);

  setDeleteTimeout(timeout);
};

  // Undo deletion
  const undoDelete = () => {
    if (deleteTimeout) {
      clearTimeout(deleteTimeout);
    }
    setPendingDelete(null);
    setCountdown(null);
    setIsDeleteDialogOpen(false);
  };

  // Convert columns to column definitions for AG Grid
  const columnDefs = useMemo(() => {
    return [
      { headerName: "No.", field: "rollNumber", sortable: true, filter: true, width: 70 },
      ...columns.map((col) => ({
        headerName: col.header,
        field: col.accessor,
        cellClass: col.className,
      })),
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <button
            onClick={(e) => handleDeleteClick(params.data.id, e)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        ),
        width: 100,
        suppressNavigable: true, // Prevents AG Grid from making it part of the row navigation
      },
    ];
  }, [columns]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: true,
    }),
    []
  );

  const handleRowClick = (event: any) => {
    if (event.event.target.tagName === "BUTTON") return; // Ignore button clicks
    const Id = event.data.id;
    router.push(`/list/${list}/${Id}`);
  };

  return (
    <div className="ag-theme-alpine" style={{ height: "700px", width: "100%" }}>
      <ToastContainer /> {/* Toast notifications container */}

      <AgGridReact
        rowData={sortedData} // Use sorted data with roll numbers
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 30, 50, 100]}
        defaultColDef={defaultColDef}
        onRowClicked={handleRowClick}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>Are you sure you want to delete this teacher?</DialogHeader>
            <DialogFooter className="flex justify-between">
              <Button onClick={undoDelete} variant="secondary">
                Cancel
              </Button>
              <Button onClick={confirmDelete} variant="destructive">
                Confirm Delete
              </Button>
            </DialogFooter>

            {countdown !== null && (
              <div className="text-center mt-2 flex">
                <span className="text-red-500 font-bold">{countdown}s remaining...</span>
                <Button onClick={undoDelete} className="mt-2">
                  Undo
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AGgrid;
