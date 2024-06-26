import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  TextField,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect, useRef, useContext } from "react";
import {
  readRetailExcel,
  createFormattedExcel,
} from "../../helper/readRetailExcel";
import { pack_exists } from "../../helper/supabaseHelpers";
import { supabase } from "../../supabaseClient";
import { SupabaseContext } from "../Contexts";
import { enqueueSnackbar } from "notistack";

const HeaderItem = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "black",
  width: "100%",
}));

const PlantPackModal = ({ file, handleModalClose }) => {
  const [packSelection, setPackSelection] = useState();
  const [detectedPacks, setDetectedPacks] = useState({});
  const [roundSelection, setRoundSelection] = useState("m");
  const excelRef = useRef(null);
  const supabase_packs = useContext(SupabaseContext);

  useEffect(() => {
    if (file) {
      async function importData() {
        await readRetailExcel(file, supabase_packs).then((data) => {
          let [excel_data, packs_found] = data;
          excelRef.current = excel_data;
          setDetectedPacks(packs_found);
          setPackSelection(Object.keys(packs_found)[0]);
        });
      }
      importData();
    }
  }, [file, supabase_packs]);

  const handleClose = () => {
    handleModalClose();
  };

  const handleAgree = async () => {
    try {
      let curr_date = `${new Date().getMonth() + 1}.${new Date().getDate()}`;
      let round_string = "";
      let round_counter = 1;
      const { data: selected_round, error: round_error } = await supabase
        .from("round_tracker")
        .select("*")
        .eq("date", curr_date);
      if (selected_round.length && roundSelection !== "ss")
        round_counter = selected_round[0][roundSelection];
      round_string =
        round_counter !== 1
          ? `${curr_date + roundSelection + round_counter}`
          : `${curr_date + roundSelection}`;

      if (
        detectedPacks !== null &&
        pack_exists(Object.keys(detectedPacks), supabase_packs)
      ) {
        const { error: plant_error } = await supabase
          .from("plant_packs")
          .upsert(
            Object.keys(detectedPacks).map((pack) => {
              let _ = { "Plant Pack": pack };
              detectedPacks[pack].forEach((plant, idx) => {
                _[`item_${idx + 1}`] = plant;
              });
              return _;
            })
          )
          .select();
      }
      let order_count = await createFormattedExcel(
        excelRef.current,
        detectedPacks,
        round_string
      );

      if (selected_round.length)
        order_count += selected_round[0]["order_count"];

      await supabase.from("round_tracker").upsert({
        date: curr_date,
        [roundSelection]: ++round_counter,
        order_count: order_count,
      });
      handleModalClose();
    } catch (error) {
      console.log(error);
    }
  };
  const handleSelection = (e, newSelection) => {
    setPackSelection(newSelection);
  };

  const handleRoundSelection = (e) => {
    setRoundSelection(e.target.value);
  };
  return (
    <>
      {Object.keys(detectedPacks).length ? (
        <>
          <DialogTitle>Input plants for plant packs</DialogTitle>

          <DialogContent>
            <Grid
              container
              sx={{ border: "1px solid black", borderRadius: "4px" }}
            >
              <Grid item container xs>
                <Stack>
                  <HeaderItem>Pack</HeaderItem>
                  <ToggleButtonGroup
                    value={packSelection}
                    exclusive
                    onChange={handleSelection}
                    orientation="vertical"
                    sx={{ height: "100%" }}
                  >
                    {Object.keys(detectedPacks).map((pack) => {
                      return (
                        <ToggleButton value={pack} key={pack}>
                          {pack}
                        </ToggleButton>
                      );
                    })}
                  </ToggleButtonGroup>
                </Stack>
              </Grid>
              <Grid item container xs>
                <HeaderItem>Plant</HeaderItem>
                <Stack flexWrap="wrap" sx={{ width: "100%" }}>
                  {Object.keys(detectedPacks).map((pack) => {
                    return (
                      packSelection === pack &&
                      detectedPacks[pack].map((plant, idx) => {
                        return (
                          <TextField
                            id={plant["plant"]}
                            fullWidth
                            variant="outlined"
                            defaultValue={plant["plant"]}
                            sx={{ color: "black", width: "100%" }}
                            onChange={(e) => {
                              let new_list = detectedPacks[pack];
                              new_list[idx]["plant"] = e.target.value;
                              setDetectedPacks({
                                ...detectedPacks,
                                [pack]: new_list,
                              });
                            }}
                          />
                        );
                      })
                    );
                  })}
                </Stack>
              </Grid>
              <Grid item container xs>
                <HeaderItem>Location</HeaderItem>
                <Stack flexWrap="wrap" sx={{ width: "100%" }}>
                  {Object.keys(detectedPacks).map((pack) => {
                    return (
                      packSelection === pack &&
                      detectedPacks[pack].map((plant, idx) => {
                        return (
                          <TextField
                            id={plant["location"]}
                            fullWidth
                            variant="outlined"
                            defaultValue={plant["location"]}
                            sx={{ color: "black" }}
                            onChange={(e) => {
                              let new_list = detectedPacks[pack];
                              new_list[idx]["location"] = e.target.value;
                              setDetectedPacks({
                                ...detectedPacks,
                                [pack]: new_list,
                              });
                            }}
                          />
                        );
                      })
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle>No packs detected!</DialogTitle>
          <DialogContent></DialogContent>
        </>
      )}
      <DialogContent sx={{ pt: "0px", pb: "0px" }}>
        <FormControl>
          <FormLabel>Round Selection</FormLabel>
          <RadioGroup row defaultValue="m" onChange={handleRoundSelection}>
            <FormControlLabel value="m" control={<Radio />} label="Main" />
            <FormControlLabel value="a" control={<Radio />} label="Autumn" />
            <FormControlLabel value="bb" control={<Radio />} label="Shrimp" />
            <FormControlLabel value="ga" control={<Radio />} label="GA" />
            <FormControlLabel value="ss" control={<Radio />} label="SS/Other" />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleAgree} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </>
  );
};

export default PlantPackModal;
