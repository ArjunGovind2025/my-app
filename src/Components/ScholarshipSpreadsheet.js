'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCombined } from './CollegeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import stringSimilarity from 'string-similarity';
import './ScholarshipTable.css';
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
      const similarity = stringSimilarity.compareTwoStrings(normalizeHeader(column), normalizeHeader(mergedColumn));
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
      const cleanedKey = key.trim().toLowerCase().replace(/^"|"$/g, ''); // Normalize keys: trim, lowercase, remove quotes
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
  const pageSize = 5; // Number of scholarships per page

  useEffect(() => {
    const fetchScholarshipData = async () => {
      if (user) {
        const userDocRef = doc(db, 'userScholarships', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const scholarshipsArray = cleanData(flattenScholarshipData(userData));
          console.log('Scholarships:', scholarshipsArray); // Debug: Log the scholarships array
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
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedScholarships = userData.scholarships || {};

        if (updatedScholarships[schoolId]) {
          updatedScholarships[schoolId] = updatedScholarships[schoolId].filter(
            (scholarship) => scholarship.scholarshipname !== scholarshipName
          );

          if (updatedScholarships[schoolId].length === 0) {
            delete updatedScholarships[schoolId];
          }

          await updateDoc(userDocRef, { scholarships: updatedScholarships });

          setScholarships(prev =>
            prev.filter(scholarship => scholarship.schoolId !== schoolId || scholarship.scholarshipname !== scholarshipName)
          );
        }
      }
    } catch (error) {
      console.error('Error removing scholarship:', error);
    }
  };

  const columns = useMemo(() => {
    if (scholarships.length === 0) return [];
    const allKeys = Array.from(new Set(scholarships.flatMap(Object.keys)));
    const mergedKeys = mergeSimilarColumns(allKeys);

    const orderedColumns = mergedKeys.map(key => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      enableSorting: true,
    }));

    const removeColumn = {
      accessorKey: 'remove',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => handleRemoveScholarship(row.original.schoolId, row.original.scholarshipname)}
          style={{ whiteSpace: 'nowrap' }}
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

  console.log('Table Rows:', table.getRowModel().rows); // Debug: Log the table rows
  console.log('Pagination State:', table.getState().pagination); // Debug: Log the pagination state

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="px-7 flex justify-between items-center">
        <CardTitle>My Scholarships</CardTitle>
        <CardDescription>A list of scholarships you have added.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups().map(headerGroup => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
                <TableRow key={row.id} className={rowIndex % 2 === 0 ? "bg-accent" : ""}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{
                        wordBreak: 'break-word'
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
      </CardContent>
    </Card>
  );
};

export default ScholarshipSpreadsheet;
