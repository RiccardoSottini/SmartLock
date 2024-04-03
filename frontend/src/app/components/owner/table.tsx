import { useState, useMemo, useCallback } from "react";
import { Status } from "../../context/AppProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faPlus,
  faChevronDown,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import {
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Link,
  Chip,
  Button,
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
} from "@nextui-org/react";

export type ColumnType = {
  key: string;
  label: string;
};

export type StatusType = {
  value: string;
  name: string;
  color:
    | "warning"
    | "success"
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | undefined;
  display: boolean;
};

const columns: ColumnType[] = [
  {
    key: "guest",
    label: "GUEST",
  },
  {
    key: "timestamp",
    label: "REQUESTED ON",
  },
  {
    key: "status",
    label: "STATUS",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

const statuses: StatusType[] = [
  {
    value: "NULL",
    name: "null",
    color: undefined,
    display: false,
  },
  {
    value: "PENDING",
    name: "Pending",
    color: "warning",
    display: true,
  },
  {
    value: "ACCEPTED",
    name: "Accepted",
    color: "success",
    display: true,
  },
  {
    value: "REJECTED",
    name: "Rejected",
    color: "danger",
    display: true,
  },
];

export type OwnerTableProps = {
  rows: any;
  onOpen: () => void;
  onOpenHistory: (guest: string) => void;
  acceptAuthorisation: (guest: string) => void;
  rejectAuthorisation: (guest: string) => void;
};

export default function OwnerTable({
  rows,
  onOpen,
  onOpenHistory,
  acceptAuthorisation,
  rejectAuthorisation,
}: OwnerTableProps) {
  const [filterValue, setFilterValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<any>("all");

  const filteredRows = useMemo(() => {
    let filteredRows = [...rows];

    if (filterValue != "") {
      filteredRows = filteredRows.filter(
        (row) =>
          row.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          row.guest.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statuses.length
    ) {
      filteredRows = filteredRows.filter((row) =>
        Array.from(statusFilter).includes(Status[row.status])
      );
    }

    return filteredRows;
  }, [rows, filterValue, statusFilter]);

  const onSearchChange = useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  const renderCell = useCallback((authorisation: any, columnKey: string) => {
    const cellValue = authorisation[columnKey];

    switch (columnKey) {
      case "guest":
        return (
          <div className="inline-flex items-center justify-center gap-2 rounded-small outline-none">
            <span className="flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none w-10 h-10 text-tiny bg-default text-default-foreground rounded-full">
              <Link
                href={authorisation.link}
                size="sm"
                color="secondary"
                isExternal
              >
                <img
                  src={authorisation.avatar}
                  className="flex object-cover w-full h-full transition-opacity !duration-500 opacity-100"
                  alt={authorisation.name}
                ></img>
              </Link>
            </span>
            <div className="inline-flex flex-col items-start">
              <span className="text-small text-inherit">
                {authorisation.name}
              </span>
              <Link
                className="authentication_link"
                href={authorisation.link}
                size="sm"
                color="secondary"
                isExternal
              >
                {authorisation.guest}
              </Link>
            </div>
          </div>
        );
      case "timestamp":
        return new Intl.DateTimeFormat("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(parseInt(cellValue) * 1000);
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statuses[cellValue].color}
            size="sm"
            variant="flat"
          >
            {Status[cellValue]}
          </Chip>
        );
      case "actions":
        let disabledKeys: string[] = ["history"];

        if (authorisation.status == Status.ACCEPTED) {
          disabledKeys = ["accept"];
        } else if (authorisation.status == Status.REJECTED) {
          disabledKeys = ["reject", "history"];
        }

        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    className="text-default-400"
                    size="xl"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu disabledKeys={disabledKeys}>
                <DropdownItem
                  key="history"
                  onClick={(e) => {
                    onOpenHistory(authorisation.guest);
                  }}
                >
                  History
                </DropdownItem>
                <DropdownItem
                  key="accept"
                  onClick={(e) => {
                    acceptAuthorisation(authorisation.guest);
                  }}
                >
                  Accept
                </DropdownItem>
                <DropdownItem
                  key="reject"
                  onClick={(e) => {
                    rejectAuthorisation(authorisation.guest);
                  }}
                >
                  Reject
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            size="sm"
            placeholder="Search by name or address..."
            startContent={<FontAwesomeIcon icon={faSearch} size="sm" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <FontAwesomeIcon icon={faChevronDown} size="1x" />
                  }
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  setStatusFilter(keys);
                }}
              >
                {statuses
                  .filter((status) => status.display)
                  .map((status) => (
                    <DropdownItem key={status.value}>
                      {status.name}
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              className="bg-default/40 text-foreground"
              endContent={<FontAwesomeIcon icon={faPlus} size="1x" />}
              size="sm"
              onPress={onOpen}
            >
              New Authorisation
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, onSearchChange, setStatusFilter]);

  return (
    <>
      <div
        className="mt-2 mb-2"
        style={{ fontSize: "20px", fontWeight: "bold" }}
      >
        List of Authorisations
      </div>
      <Table
        className="mt-2"
        topContent={topContent}
        topContentPlacement="inside"
      >
        <TableHeader>
          {columns.map((column: any) => (
            <TableColumn
              key={column.key}
              className={
                column.key == "status" || column.key == "actions"
                  ? "text-center"
                  : "text-left"
              }
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          items={filteredRows}
          emptyContent={"No authorisation to display"}
        >
          {(row: any) => (
            <TableRow key={row.key}>
              {(columnKey) => (
                <TableCell
                  className={
                    columnKey == "status" || columnKey == "actions"
                      ? "text-center"
                      : "text-left"
                  }
                >
                  {renderCell(row, String(columnKey))}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
