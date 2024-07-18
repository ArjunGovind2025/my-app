import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as needed
import { useCombined } from './CollegeContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '/Users/arjungovind/Desktop/ai-D/my-app/src/Components/ui/table.jsx'; // Import the custom table components
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import './CollegeSpreadsheet.css';

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
      },
      {
        accessorKey: 'Total price for out-of-state students 2022-23',
        header: 'Cost of Attendance',
      },
      {
        accessorKey: 'myPrice',
        header: 'My Estimated Net Cost',
      },
      {
        accessorKey: '% Admitted-Total',
        header: 'Acceptance Rate',
        cell: info => `${info.getValue()}%`
      },
      {
        accessorKey: 'meritQualified',
        header: 'Qualified for Merit Aid',
        cell: info => info.getValue() ? 'Yes' : 'No',
      },
      {
        accessorKey: 'Avg merit award for Freshman w/out need',
        header: 'Avg Merit Aid Award'
      },
      {
        accessorKey: 'SAT/ACT Required',
        header: 'SAT/ACT Required',
      },
      {
        accessorKey: '1st Early Decision Deadline',
        header: 'ED Deadline',
      },
      {
        accessorKey: 'Early Decision Acceptance Rate',
        header: 'ED Acceptance',
      },
      {
        accessorKey: 'Early Action Deadline',
        header: 'EA Deadline',
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
    <div className="my-colleges-container">
      <h1>My Colleges</h1>
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
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={header.column.id === 'myPrice' ? 'highlight-green table-header-wrap' : 'table-header-wrap'}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽'
                  }[header.column.getIsSorted()] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === 'myPrice' ? 'highlight-green small-font' : 'small-font'}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CollegeSpreadsheet;
