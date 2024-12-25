'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCombined } from './CollegeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import stringSimilarity from 'string-similarity';
import Modal from "./Modal";
import './ScholarshipSpreadsheet.css';
import { File } from "lucide-react";
import { Button } from "./ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import '../global.css';

const normalizeHeader = (header) => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const mergeSimilarColumns = (columns) => {
  const threshold = 0.8;
  let mergedColumns = [];

  columns.forEach((column) => {
    let found = false;

    for (let mergedColumn of mergedColumns) {
      const similarity = stringSimilarity.compareTwoStrings(
        normalizeHeader(column),
        normalizeHeader(mergedColumn)
      );
      if (similarity >= threshold) {
        found = true;
        break;
      }
    }

    if (!found) {
      mergedColumns.push(column);
    }
  });

  return mergedColumns;
};

const cleanData = (data) => {
  return data.map((item) => {
    const cleanedItem = {};
    for (let key in item) {
      const cleanedKey = key.trim().toLowerCase().replace(/^"|"$/g, '');
      cleanedItem[cleanedKey] = item[key];
    }
    return cleanedItem;
  });
};

const flattenScholarshipData = (data) => {
  return Object.entries(data.scholarships || {}).flatMap(([schoolId, scholarships]) =>
    scholarships.map(scholarship => ({
      schoolId,
      ...scholarship,
    }))
  );
};

const ScholarshipSpreadsheet = () => {
  const { user } = useCombined();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 5; // Number of scholarships per page

  useEffect(() => {
    const fetchScholarshipData = async () => {
      if (user) {
        const userDocRef = doc(db, 'userScholarships', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const scholarshipsArray = cleanData(flattenScholarshipData(userData));
          console.log('Scholarships:', scholarshipsArray); // Debug
          setScholarships(scholarshipsArray);
        } else {
          console.log(`No document found for user ID: ${user.uid}`);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchScholarshipData();
  }, [user]);

  const handleRemoveScholarship = async (schoolId, scholarshipName) => {
    if (!user) return;
  
    const userDocRef = doc(db, 'userScholarships', user.uid);
  
    try {
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        console.log('No user document found.');
        return;
      }
  
      const userData = userDocSnap.data();
      const updatedScholarships = { ...userData.scholarships };
  
      console.log('Fetched userScholarships:', JSON.stringify(updatedScholarships, null, 2));
      console.log('schoolId:', schoolId);
      console.log('scholarshipName:', scholarshipName);
  
      if (!updatedScholarships[schoolId]) {
        console.log(`SchoolId "${schoolId}" not found in scholarships.`);
        return;
      }
  
      console.log(`Found schoolId "${schoolId}" in scholarships.`);
  
      const scholarshipsArray = updatedScholarships[schoolId];
      console.log('Scholarships for schoolId:', JSON.stringify(scholarshipsArray, null, 2));
  
      let indexToRemove = -1;
  
      for (let i = 0; i < scholarshipsArray.length; i++) {
        const currentScholarship = scholarshipsArray[i];
        console.log(`Current Scholarship Object [Index ${i}]:`, JSON.stringify(currentScholarship, null, 2));
  
        // IMPORTANT: Check for all variations, including "Scholarship name"
        const currentScholarshipName =
          currentScholarship['scholarship name']?.trim().toLowerCase() ||
          currentScholarship['Scholarship name']?.trim().toLowerCase() ||
          currentScholarship['Scholarship Name']?.trim().toLowerCase();
  
        const targetScholarshipName = scholarshipName?.trim().toLowerCase();
  
        console.log(`Comparing: "${currentScholarshipName}" === "${targetScholarshipName}"`);
  
        if (currentScholarshipName === targetScholarshipName) {
          console.log(`Match found at index ${i}`);
          indexToRemove = i;
          break;
        }
      }
  
      if (indexToRemove === -1) {
        console.log(`Scholarship "${scholarshipName}" not found for schoolId "${schoolId}".`);
        return;
      }
  
      // Remove the scholarship
      console.log(`Removing scholarship at index ${indexToRemove}`);
      scholarshipsArray.splice(indexToRemove, 1);
  
      // Remove the school entry if no scholarships are left
      if (scholarshipsArray.length === 0) {
        console.log(`No scholarships left for "${schoolId}". Removing school entry.`);
        delete updatedScholarships[schoolId];
      }
  
      // Update Firestore
      console.log('Updating Firestore with new scholarships:', JSON.stringify(updatedScholarships, null, 2));
      await updateDoc(userDocRef, { scholarships: updatedScholarships });
  
      console.log('Successfully updated Firestore.');
  
      // Update local state so it disappears from the UI immediately
      const updatedState = scholarships.filter(
        (scholarship) =>
          !(
            scholarship.schoolId === schoolId &&
            // Also check both variations for removing locally
            (
              scholarship['scholarship name']?.trim().toLowerCase() === scholarshipName?.trim().toLowerCase() ||
              scholarship['Scholarship name']?.trim().toLowerCase() === scholarshipName?.trim().toLowerCase()
            )
          )
      );
      setScholarships([...updatedState]); // Trigger re-render with a new array reference
  
      console.log('Updated local state.');
    } catch (error) {
      console.error('Error removing scholarship:', error);
    }
  };

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
    const docPDF = new jsPDF();
    autoTable(docPDF, {
      head: [
        table.getHeaderGroups().flatMap((headerGroup) =>
          headerGroup.headers.map((header) => header.column.columnDef.header)
        ),
      ],
      body: table.getRowModel().rows.map((row) =>
        row.getVisibleCells().map((cell) => cell.getValue())
      ),
    });
    docPDF.save("colleges.pdf");
  };

  const exportAsExcel = () => {
    const header = table
      .getHeaderGroups()
      .flatMap((headerGroup) => headerGroup.headers.map((header) => header.column.columnDef.header));

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

  // Build columns
  const columns = useMemo(() => {
    if (scholarships.length === 0) return [];

    // Merge keys from all scholarship objects
    const allKeys = Array.from(new Set(scholarships.flatMap(Object.keys)));
    const mergedKeys = mergeSimilarColumns(allKeys);

    const orderedColumns = mergedKeys.map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      enableSorting: true,
    }));

    const removeColumn = {
      accessorKey: 'remove',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() =>
            handleRemoveScholarship(
              row.original['schoolid'],
              row.original['scholarship name'] || row.original['Scholarship name']
            )
          }
          style={{ whiteSpace: 'nowrap'}}
        >
          Remove
        </button>
      ),
      enableSorting: false,
    };

    return [...orderedColumns, removeColumn];
  }, [scholarships]);

  const table = useReactTable({
    data: scholarships,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex, pageSize }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(scholarships.length / pageSize),
  });

  console.log('Table Rows:', table.getRowModel().rows); // Debug
  console.log('Pagination State:', table.getState().pagination); // Debug

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showModal && (
        <Modal
          message="Please upgrade to Premium to use this feature."
          onClose={() => setShowModal(false)}
        />
      )}
      <Card>
        <CardHeader className="px-7 flex justify-between items-center">
          <CardTitle>Scholarship Spreadsheet</CardTitle>
          <CardDescription>
            A list of scholarships you are interested in.
          </CardDescription>
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
              <DropdownMenuItem onClick={() => handleExport(exportAsPDF)}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(exportAsExcel)}>
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          whiteSpace: 'nowrap',
                          cursor: header.column.getCanSort() ? 'pointer' : 'default'
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽'
                        }[header.column.getIsSorted()] ?? null}
                      </TableHead>
                    ))}
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    className={rowIndex % 2 === 0 ? "bg-accent" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                    Add scholarships from the school page.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default ScholarshipSpreadsheet;
