import {
  Box,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderContext,
  Row,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import { useRouter } from 'next/navigation';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { common } from "@mui/material/colors";
import React, { useState } from "react";
import { ExchangeHistoryInfoFlat, ExchangeHistoryInfoFlatName } from "../domain/entities/exchangeHistoryInfo/exchangeHistoryInfo";

function OrderTable(props: {
  exchangeHistoryInfoFlat: ExchangeHistoryInfoFlat[];
  headerColorCode?: string;
  userType: "seller" | "user";
}): JSX.Element {
  const { exchangeHistoryInfoFlat, headerColorCode, userType} = props;

  const router = useRouter();

  const [filterConditions, setFilterConditions] = useState<
    { id: string; value: string | number }[]
  >([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "expiredAt", desc: true } //ソートの初期値
  ]);
  const [pageSetting, setPageSetting] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const getCustomHeader = (
    name: string,
    isSortable: boolean,
    props: HeaderContext<any, unknown>
  ) =>
    isSortable ? (
      <TableSortLabel
        onClick={() => {
          if (props.header.id === sorting[0].id) {
            setSorting([{ ...sorting[0], desc: !sorting[0].desc }]);
          } else {
            setSorting([{ id: props.header.id, desc: true }]);
          }
        }}
        IconComponent={() => (
          <ArrowDropDownIcon
            sx={{
              fontSize: "2rem",
              color: sorting[0].id === props.header.id ? common.white : "grey",
              transform:
                sorting[0].desc === true && sorting[0].id === props.header.id
                  ? "rotate(180deg)"
                  : "rotate(0)"
            }}
          />
        )}
      >
        <Typography color="common.white" sx={{ fontWeight: "bold" }}>
          {name}
        </Typography>
      </TableSortLabel>
    ) : (
      <Typography color="common.white" sx={{ fontWeight: "bold" }}>
        {name}
      </Typography>
    );
  const getCustomBody = (
    props: CellContext<any, unknown>,
    align: "center" | "right" | "left",
  ) =>
  <TableCell align={align} key={props.cell.id}>
    <Typography>{props.cell.getValue<string>()}</Typography>
  </TableCell>

  const COLUMNS: ColumnDef<ExchangeHistoryInfoFlat>[] = Object.entries(ExchangeHistoryInfoFlatName).map(([key, title]) => ({
    header: (props) => getCustomHeader(title, true, props), // titleがnullならデフォルト値""を使用
    accessorKey: key,
    cell: (props) => getCustomBody(props, "center"), // 必要に応じてカスタマイズ
  }));
  
  const table = useReactTable({
    data: exchangeHistoryInfoFlat ?? [],
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: sorting,
      columnFilters: filterConditions,
      pagination: {
        pageIndex: pageSetting.pageIndex,
        pageSize: pageSetting.pageSize
      }
    }
  });  

  return (
  <>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '300px', // デフォルトの幅（主にスマートフォン向け）
          overflowX: 'auto',
          '@media (min-width: 600px)': { // 600px 以上の画面幅で適用されるスタイル（PC向け）
            width: '1000px',
          },
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: headerColorCode }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell align="center" key={header.id} sx={{ minWidth: 10}}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    router.push(`/order/detail?userType=${userType}&exchangeTxHash=${row.original.exchangeTxHash}`)                    
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <React.Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </React.Fragment>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>

    <Box
      sx={{
        textAlign: "center",
        marginTop: "2rem",
        marginBottom: "2rem"
      }}
    >
      <Button
        disabled={!table.getCanPreviousPage()}
        onClick={() =>
          setPageSetting((old) => {
            return { ...pageSetting, pageIndex: old.pageIndex - 1 };
          })
        }
      >
        前のページ
      </Button>
      <Select
        value={pageSetting.pageIndex}
        disabled={table.getPageCount() === 0}
        onChange={(e) =>
          setPageSetting({
            ...pageSetting,
            pageIndex: e.target.value as number
          })
        }
      >
        {[...Array(table.getPageCount())].map((_, index) => (
          <MenuItem key={index} value={index}>
            {table.getPageCount() !== 0
              ? `${index + 1}/${table.getPageCount()}`
              : 0}
          </MenuItem>
        ))}
      </Select>
      <Button
        disabled={!table.getCanNextPage()}
        onClick={() =>
          setPageSetting((old) => {
            return { ...pageSetting, pageIndex: old.pageIndex + 1 };
          })
        }
      >
        次のページ
      </Button>
    </Box>  
  </>
  );
}

export default OrderTable;
