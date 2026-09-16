import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps {
  columns: string[];
  loading?: boolean;
  empty?: React.ReactNode;
  children: React.ReactNode;
}

export function DataTable({ columns, loading, empty, children }: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <div className="flex flex-col gap-2 py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </TableCell>
          </TableRow>
        ) : empty ? (
          <TableRow>
            <TableCell colSpan={columns.length}>{empty}</TableCell>
          </TableRow>
        ) : (
          children
        )}
      </TableBody>
    </Table>
  );
}
