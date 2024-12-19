import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { db, auth } from '../firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import '../global.css';
import './ScholarshipTable.css';

const parseCSV = (data) => {
  const lines = data.split('\n');
  const headers = lines[0].split(';').map(header => header.trim());
  const rows = lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(/;(?!\s)/).map(value => value.trim().replace(/"/g, ''));
    let rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header] = values[index] || '';  // handle missing values
    });
    return rowObject;
  });
  return { headers, rows };
};

const ScholarshipTable = ({ data, ipedsId }) => {
  const { headers, rows } = useMemo(() => parseCSV(data), [data]);

  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedScholarships, setSelectedScholarships] = useState([]);
  const [idToSchoolNames, setIdToSchoolNames] = useState({});

  // Fetch the reverse mapping once when component mounts
  useEffect(() => {
    const fetchReverseMapping = async () => {
      const idToNameRef = doc(db, 'nameToID', 'IPEDSIDToCollegeName');
      const idToNameDoc = await getDoc(idToNameRef);

      if (idToNameDoc.exists()) {
        setIdToSchoolNames(idToNameDoc.data());
      } else {
        console.error('No reverse mapping document found!');
      }
    };

    fetchReverseMapping();
  }, []);

  const columns = useMemo(
    () => headers.map(header => ({
      accessorKey: header,
      header: header,
      enableSorting: true,
    })),
    [headers]
  );

  const table = useReactTable({
    data: rows,
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

  const addScholarship = async (scholarship) => {
    const user = auth.currentUser;

    if (user) {
      const collegeName = idToSchoolNames[ipedsId];

      if (!collegeName) {
        console.error(`No college name found for IPEDS ID: ${ipedsId}`);
        return;
      }

      const userDocRef = doc(db, "userScholarships", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const existingData = userDoc.data();
        const updatedScholarships = existingData.scholarships || {};

        if (updatedScholarships[collegeName]) {
          updatedScholarships[collegeName] = [...updatedScholarships[collegeName], scholarship];
        } else {
          updatedScholarships[collegeName] = [scholarship];
        }

        await updateDoc(userDocRef, {
          scholarships: updatedScholarships
        });
      } else {
        await setDoc(userDocRef, {
          scholarships: {
            [collegeName]: [scholarship]
          }
        });
      }

      setSelectedScholarships((prev) => [...prev, scholarship]);
    } else {
      console.error("No user is signed in");
    }
  };

  return (
    <Card>
      <CardHeader className="px-7 flex justify-between items-center">
        <CardTitle>Scholarship Data</CardTitle>
        <CardDescription>A table displaying scholarship information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Add</TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? 'cursor-pointer' : ''}
                    style={{ 
                      whiteSpace: 'normal', // Allow word wrapping
                      wordBreak: 'keep-all', // Prevent breaking words mid-word
                      maxWidth: '150px' // Set a max width for the headers
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
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className={row.index % 2 === 0 ? "bg-accent" : ""}>
                <TableCell>
                  <button className="add-scholarship-button" onClick={() => addScholarship(row.original)}>Add</button>
                </TableCell>
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
      {selectedScholarships.length > 0 && (
        <div className="p-4">
          <h2>Selected Scholarships</h2>
          <ul>
            {selectedScholarships.map((scholarship, index) => (
              <li key={index}>{JSON.stringify(scholarship)}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ScholarshipTable;
