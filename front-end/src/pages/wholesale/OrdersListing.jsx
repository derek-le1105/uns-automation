import { Box, LinearProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

import { useTheme } from "@mui/material/styles";

import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { useState, useEffect } from "react";

import BatchEdits from "../../components/wholesale/BatchEdits";
import WholesaleHeader from "../../components/wholesale/WholesaleHeader";
import BatchModal from "../../components/wholesale/BatchModal";
import CustomNoRowsOverlay from "../../components/wholesale/CustomNoRowsOverlay";
import { getWholesaleDates } from "../../helper/getWholesaleDates";
import { objectLength, isObjectIncluded } from "../../helper/dataFunctions";
import { createWholesaleExcel } from "../../helper/createWholesaleExcel";

import { supabase } from "../../supabaseClient";

const WholesaleOrders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const wholesaleDates = getWholesaleDates();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [beforeDate, setBeforeDate] = useState(dayjs(wholesaleDates[0]));
  const [afterDate, setAfterDate] = useState(dayjs(new Date()));
  const [shipoutDate, setShipoutDate] = useState(dayjs(wholesaleDates[1]));
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const [supabaseData, setSupabaseData] = useState([]);

  async function fetchData() {
    const { data } = await supabase
      .from("batch_data")
      .select()
      .eq("wednesday_date", format(wholesaleDates[1], "MM/dd/yyyy"))
      .limit(1)
      .maybeSingle();

    setSupabaseData(objectLength(data));
  }

  useEffect(() => {
    fetchData().catch((error) => {
      console.log(error.lineNumber);
    });

    if (JSON.parse(sessionStorage.getItem("orders")) !== null)
      setOrders(JSON.parse(sessionStorage.getItem("orders")));
    else getShopify();
  }, []);

  const getShopify = async () => {
    enqueueSnackbar(
      `Pulling Shopify orders between dates ${format(
        beforeDate.$d,
        "MM/dd/yyyy"
      )} - ${format(afterDate.$d, "MM/dd/yyy")}`,
      {
        variant: "success",
      }
    );
    setLoading(true);
    try {
      getWholesaleDates(afterDate, beforeDate);

      const response = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([afterDate, beforeDate]),
      }).catch((error) => {
        enqueueSnackbar(error, {
          variant: "error",
        });
        console.log(error.lineNumber);
      });

      const orders = await response.json();
      setLoading(false);
      setOrders(orders);
      sessionStorage.setItem(
        "orders",
        JSON.stringify(orders.length === 0 ? null : orders)
      );
    } catch (error) {
      enqueueSnackbar(error, {
        variant: "error",
      });
      console.log(error.lineNumber);
    }
  };

  const generateExcel = async () => {
    try {
      //TODO: allow user to download excel files without uploading to db
      let batch_day = [new Date().getDay()].toString();
      var batch_length = supabaseData[0];
      var new_batch = batchList.map((order, index) => {
        return {
          ...orders[order],
          batch: batch_day,
        };
      });

      if (supabaseData !== null) {
        let curr_batch = supabaseData[1].filter(
          (order) => order.batch === batch_day
        );
        new_batch =
          curr_batch.length < 1
            ? [...new_batch]
            : [...curr_batch, ...new_batch];
      }
      new_batch.sort((a, b) => {
        return (
          parseInt(a.order_name.slice(-5)) - parseInt(b.order_name.slice(-5))
        );
      });

      await createWholesaleExcel(
        orders.filter((_, idx) => batchList.includes(idx)),
        batch_length,
        format(shipoutDate.$d, "MM/dd/yyyy")
      );
      await supabase.from("batch_data").upsert({
        //create an entry in the db with the new wed date along with data from Shopify
        wednesday_date: format(shipoutDate.$d, "MM/dd/yyyy"),
        [batch_day]: new_batch,
      });
      fetchData();
    } catch (error) {
      console.log(error.lineNumber);
    }
  };

  const handleDialogClose = (valid_confirmation) => {
    setOpenEditModal(false);
    setOpenModal(false);
    if (valid_confirmation) generateExcel();
  };

  const handleDateChange = (new_date, type) => {
    switch (type) {
      case "before":
        setBeforeDate(new_date);
        sessionStorage.setItem("before_date", new_date);
        break;
      case "after":
        setAfterDate(new_date);
        sessionStorage.setItem("after_date", new_date);
        break;
      case "shipout":
        setShipoutDate(new_date);
        sessionStorage.setItem("shipout_date", new_date);
        break;
      default:
    }
  };

  const handleRefreshClick = () => {
    if (beforeDate - afterDate > 0) {
      enqueueSnackbar("Please pick a valid date range", {
        variant: "error",
      });
    } else getShopify();
  };

  const handleCreateClick = () => {
    if (batchList.length < 1) {
      enqueueSnackbar("Please select at least one order", {
        variant: "error",
      });
    } else setOpenModal(true);
  };

  const handleBatchEditClick = () => {
    setOpenEditModal(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          background: `${theme.palette.grey[100]}`,
        }}
      >
        <WholesaleHeader
          beforeDate={beforeDate}
          afterDate={afterDate}
          shipoutDate={shipoutDate}
          onDateChange={handleDateChange}
          onRefreshClick={handleRefreshClick}
          onCreateClick={handleCreateClick}
          validSelection={batchList.length}
          onEditClick={handleBatchEditClick}
        ></WholesaleHeader>
        <Box
          sx={{
            padding: "0px 50px 50px 50px",
            display: "grid",
          }}
        >
          <DataGrid
            hideFooter
            autoHeight
            editMode="row"
            loading={loading}
            slots={{
              loadingOverlay: LinearProgress,
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            rows={orders.map((order, idx) => {
              return {
                id: idx,
                order_name: order.order_name,
                customer: order.customer.firstName,
                shipping: order.shipping,
              };
            })}
            columns={[
              {
                field: "order_name",
                headerName: "Order Name",
                flex: 0.5,
                align: "right",
                headerAlign: "right",
              },
              {
                field: "customer",
                headerName: "Customer",
                flex: 1,
              },
              {
                field: "status",
                headerName: "Is in previous batch?",
                flex: 0.5,
                align: "center",
                headerAlign: "center",
                renderCell: (params) =>
                  isObjectIncluded(supabaseData[1], params.row) ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  ),
              },
              {
                field: "shipping",
                headerName: "Shipping Method",
                flex: 1,
                editable: true,
                type: "singleSelect",
                valueOptions: ["Fedex", "GLS", "Airport", "Local"],
                align: "left",
                headerAlign: "left",
              },
            ]}
            checkboxSelection={true}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setBatchList(newRowSelectionModel);
            }}
            rowSelectionModel={batchList}
          ></DataGrid>
          <BatchModal
            openModal={openModal}
            onClose={handleDialogClose}
            batch={orders.filter((_, idx) => batchList.includes(idx))}
            supabaseData={supabaseData}
          />
          <BatchEdits
            openEditModal={openEditModal}
            onClose={handleDialogClose}
            shipoutDate={format(shipoutDate.$d, "MM/dd/yyyy")}
            supabaseData={supabaseData}
          />
        </Box>
      </Box>
    </>
  );
};

export default WholesaleOrders;
