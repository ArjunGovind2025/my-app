"use client"

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as needed
import { useCombined } from './CollegeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { File } from "lucide-react"
import '../global.css';

const CollegeSpreadsheet = () => {
  const { user, myColleges } = useCombined();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  useEffect(() => {
    const fetchCollegeData = async () => {
      if (myColleges) {
        const collegePromises = Object.keys(myColleges).map(async (ipedsId) => {
          const collegeDocRef = doc(db, 'collegeData', ipedsId);
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
        setColleges(collegesArray.filter(college => college !== null));
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchCollegeData();
  }, [myColleges]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'Name',
        header: 'Name',
        enableSorting: true,
      },
      {
        accessorKey: 'Total price for out-of-state students 2022-23',
        header: 'Cost of Attendance',
        enableSorting: true,
      },
      {
        accessorKey: 'myPrice',
        header: 'My Estimated Net Cost',
        enableSorting: true,
      },
      {
        accessorKey: '% Admitted-Total',
        header: 'Acceptance Rate',
        cell: info => `${info.getValue()}%`,
        enableSorting: true,
      },
      {
        accessorKey: 'meritQualified',
        header: 'Qualified for Merit Aid',
        cell: info => info.getValue() ? 'Yes' : 'No',
        enableSorting: true,
      },
      {
        accessorKey: 'Avg merit award for Freshman w/out need',
        header: 'Avg Merit Aid Award',
        enableSorting: true,
      },
      {
        accessorKey: 'SAT/ACT Required',
        header: 'SAT/ACT Required',
        enableSorting: true,
      },
      {
        accessorKey: '1st Early Decision Deadline',
        header: 'ED Deadline',
        enableSorting: true,
      },
      {
        accessorKey: 'Early Decision Acceptance Rate',
        header: 'ED Acceptance',
        enableSorting: true,
      },
      {
        accessorKey: 'Early Action Deadline',
        header: 'EA Deadline',
        enableSorting: true,
      },
      // Add more columns as needed
    ],
    []
  );

  const table = useReactTable({
    data: colleges,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="px-7 flex justify-between items-center">
        <CardTitle>My Spreadsheet</CardTitle>
        <CardDescription>A list of colleges you are interested in.</CardDescription>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-sm"
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="table-controls">
          <input
            placeholder="Filter by name..."
            value={table.getColumn('Name')?.getFilterValue() || ''}
            onChange={e => table.getColumn('Name')?.setFilterValue(e.target.value)}
            className="filter-input"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups().map(headerGroup => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={header.column.getCanSort() ? 'cursor-pointer' : ''}
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
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className={row.index % 2 === 0 ? "bg-accent" : ""}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CollegeSpreadsheet;
