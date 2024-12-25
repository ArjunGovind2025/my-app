"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; 
import { useCombined } from "./CollegeContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { File } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Modal from "./Modal";
import "../global.css";
import { UpgradeTooltip } from "./UpgradeTooltip";
import "./CollegeSpreadsheet.css"

const CollegeSpreadsheet = () => {
  const { user, myColleges } = useCombined();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [visibleColleges, setVisibleColleges] = useState([]);

  useEffect(() => {
    const fetchCollegeData = async () => {
      if (myColleges && user) {
        const userDocRef = doc(db, 'userData', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newVisibleColleges = userData.visibleColleges || [];
          setVisibleColleges(newVisibleColleges);
          console.log('Visible Colleges after update:', newVisibleColleges); 
        }

        const collegePromises = Object.keys(myColleges).map(async (ipedsId) => {
          const collegeDocRef = doc(db, "collegeData", ipedsId);
          const collegeDocSnap = await getDoc(collegeDocRef);

          if (collegeDocSnap.exists()) {
            const collegeData = collegeDocSnap.data();
            const userCollegeData = myColleges[ipedsId];
            return { ipedsId, ...collegeData, myPrice: userCollegeData.myPrice };
          } else {
            console.log(`No such document with IPEDS ID: ${ipedsId}`);
            return null;
          }
        });

        const collegesArray = await Promise.all(collegePromises);
        setColleges(collegesArray.filter((college) => college !== null));
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchCollegeData();
  }, [myColleges, user]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) || // Prevent Ctrl+C, Ctrl+U, Ctrl+S
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Prevent Ctrl+Shift+I
        (e.metaKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) || // Prevent Cmd+C, Cmd+U, Cmd+S (Mac)
        (e.metaKey && e.shiftKey && e.key === 'I') // Prevent Cmd+Shift+I (DevTools on Mac)
      ) {
        e.preventDefault();
      }
    };
  
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); 

  const checkUserAccess = async (userId) => {
    try {
      const userDocRef = doc(db, 'userData', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.access === "Premium";
      }
    } catch (error) {
      console.error("Error checking user access:", error);
    }
    return false;
  };

  const handleExport = async (exportFunc) => {
    const hasPremiumAccess = await checkUserAccess(user.uid);
    if (hasPremiumAccess) {
      exportFunc();
    } else {
      setShowModal(true);
    }
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        table.getHeaderGroups().flatMap((headerGroup) =>
          headerGroup.headers.map((header) => header.column.columnDef.header)
        ),
      ],
      body: table.getRowModel().rows.map((row) =>
        row.getVisibleCells().map((cell) => cell.getValue())
      ),
    });
    doc.save("colleges.pdf");
  };

  const exportAsExcel = () => {
    const header = table.getHeaderGroups().flatMap((headerGroup) =>
      headerGroup.headers.map((header) => header.column.columnDef.header)
    );

    const data = table.getRowModel().rows.map((row) =>
      row.getVisibleCells().reduce((acc, cell) => {
        acc[cell.column.columnDef.header] = cell.getValue();
        return acc;
      }, {})
    );

    const worksheet = XLSX.utils.json_to_sheet(data, { header });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colleges");
    XLSX.writeFile(workbook, "colleges.xlsx");
  };

  

  const columns = React.useMemo(
    () => [

      { accessorKey: "Name", header: "Name", enableSorting: true },
      { accessorKey: "Total_price_for_out_of_state_students_2022_23", header: "Cost of Attendance", enableSorting: true },
      {
        accessorKey: "myPrice",
        header: "My Estimated Net Cost",
        enableSorting: true,
        cell: ({ row }) => {
          const ipedsId = row.original.ipedsId;
          const isVisible = visibleColleges.includes(ipedsId);
  
          console.log('Processing row for IPEDS ID:', ipedsId);
          console.log('Is Visible:', isVisible);
          console.log('Row Data:', row.original);

          return (
            <span
              className={`${
                isVisible ? "text-green-600 font-bold" : "blurred-text"
              }`}
            >
              {row.original.myPrice}
            </span>
          );
        },
      },
      { accessorKey: "% Admitted-Total", header: "Acceptance Rate", cell: (info) => `${info.getValue()}%`, enableSorting: true },
      { accessorKey: "Avg % of Need met for Freshman", header: "% Need Met", cell: (info) => `${info.getValue()}%`, enableSorting: true },
      { accessorKey: "Avg_merit_award_for_Freshman_without_need", header: "Avg Merit Aid Award", enableSorting: true },
      { accessorKey: "Percent_Freshman_without_need_receiving_merit_aid", header: "% Receiving Merit Aid", cell: (info) => `${info.getValue()}%`, enableSorting: true },
      { accessorKey: "SAT/ACT Required", header: "SAT/ACT Required", enableSorting: true },
      { accessorKey: "1st Early Decision Deadline", header: "ED Deadline", enableSorting: true },
      { accessorKey: "Early Decision Acceptance Rate", header: "ED Acceptance", enableSorting: true },
      { accessorKey: "Early Action Deadline", header: "EA Deadline", enableSorting: true },
    ],
    [visibleColleges] //  columns re-render when visibleColleges changes
  );

  const table = useReactTable({
    data: colleges,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading || !visibleColleges.length) {
    return <div>Loading...</div>;
  }


  return (
    <>
      {showModal && <Modal message="Please upgrade to Premium to use this feature." onClose={() => setShowModal(false)} />}
      <Card>
        <CardHeader className="px-7 flex justify-between items-center">
          <CardTitle>My Spreadsheet</CardTitle>
          <CardDescription>A list of colleges you are interested in.</CardDescription>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport(exportAsPDF)}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(exportAsExcel)}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="table-controls">
            <input
              placeholder="Filter by name..."
              value={table.getColumn("Name")?.getFilterValue() || ""}
              onChange={(e) => table.getColumn("Name")?.setFilterValue(e.target.value)}
              className="filter-input"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? "cursor-pointer" : ""}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted()] ?? null}
                      </TableHead>
                    ))}
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={row.index % 2 === 0 ? "bg-accent" : ""}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                    {["myPrice", "Avg_merit_award_for_Freshman_without_need", "meritQualified", "Percent_Freshman_without_need_receiving_merit_aid"].includes(cell.column.id) ? (
                      visibleColleges.includes(Number(row.original.ipedsId)) ? (
                        <span
                          style={{
                            backgroundColor: cell.column.id === "myPrice" ? "#ebfcf5" : "transparent", // Highlight "myPrice" column
                            color: cell.column.id === "myPrice" ? "#1b202b" : "inherit", // Add green text for "myPrice"
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                          }}
                        >
                          {cell.getValue()}
                        </span>
                      ) : (
                        <UpgradeTooltip>
                          <span style={{ color: "#9ca3af" }}>{cell.getValue()}</span>
                        </UpgradeTooltip>
                      )
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                  

                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
  
  
};

export default CollegeSpreadsheet;
