import React, { useEffect, useRef, useState } from "react";


import { Button, FormControl, Select, MenuItem, Divider, FormControlLabel, RadioGroup, FormLabel, Radio, ButtonGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Sphere from './system/Sphere';
// import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';

import { ClipLoader } from 'react-spinners'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  table: {
    minWidth: 450,
    fontSize: "12px",
  },
}));

function App() {
  const classes = useStyles();
  const [netuid, setNetUid] = useState(1);
  const [isOpenStake, openStakeDetails] = useState(false)
  const [isOpenDetails, openDetails] = useState(false)
  const [selectedNeuron, selectNeuron] = useState({});

  const [index, setIndex] = useState(0);
  const [neurons, setNeurons] = useState([]);

  useEffect(() => {
    selectNeuron(neurons[index]);
  }, [index])

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ position: "absolute", zIndex: 50, top: 20, left: 50, mixBlendMode: "darken" }}>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5PDPdXCbk-36GLCvfvg3kXXST7HA7uw47m3AJPQNb7n-PpzAdbj2oDTSATj2QkuTRv-g" alt="" width={80} height={80} />
      </div>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", right: "20px", top: "20px", width: "500px", padding: "1rem", backgroundColor: "#ffffffa0", borderRadius: "16px", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center" }}>

          <FormLabel id="netuid" style={{ marginRight: "8px" }}> Netuid </FormLabel>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="netuid"
              name="row-radio-buttons-group"
              value={netuid}
              onChange={(e) => { setNetUid(Number(e.target.value)) }}
            >
              <FormControlLabel value={1} control={<Radio />} label="1" />
              <FormControlLabel value={3} control={<Radio />} label="3" />
              <FormControlLabel value={11} control={<Radio />} label="11" />
            </RadioGroup>
          </FormControl>
          <div style={{ flexGrow: 1 }}></div>
          {neurons.length == 0 &&
            <ClipLoader />
          }
        </div>
        {selectedNeuron?.uid > 0 &&
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Button variant="contained" color="primary" onClick={() => { openDetails(!isOpenDetails) }}>
                  Block: {selectedNeuron.last_update}
                </Button>
                <Button variant="outlined" size="small" style={{ marginLeft: "8px" }}>
                  uid: {selectedNeuron.uid} - {selectedNeuron.validator_permit ? "Validator" : "Miner"}
                </Button>
              </div>
              <ButtonGroup
                size="small"
                variant="contained" color="secondary"
                aria-label="small button group"
              >
                <Button onClick={() => { index && setIndex(index - 1) }}>PREV</Button>
                <Button onClick={() => { index < neurons.length - 1 && setIndex(index + 1) }}>NEXT</Button>
              </ButtonGroup>
            </div>
            {isOpenDetails &&
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Divider style={{ marginTop: "5px", marginBottom: "5px", }} />
                {/* <p style={{ marginBottom: "5px", marginTop: "5px" }}> Block: {selectedNeuron.last_update} </p> */}
                <p style={{ marginBottom: "5px", marginTop: "5px" }}> hotkey: <span style={{ fontSize: 12 }}> {selectedNeuron.hotkey} </span></p>
                <p style={{ marginBottom: "5px", marginTop: "5px" }}> coldkey: <span style={{ fontSize: 12 }}> {selectedNeuron.coldkey} </span></p>
                <Button variant="outlined" size="small" onClick={() => { openStakeDetails(!isOpenStake) }}>
                  {isOpenStake ? "Close" : "Open"} Stake
                </Button>
                <Divider style={{ marginTop: "5px", marginBottom: "5px", }} />
                {isOpenStake &&
                  <>
                    <h4> Stake </h4>
                    <div style={{ maxHeight: "450px", overflowY: "auto" }}>
                      <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell> Coldkey</TableCell>
                              <TableCell align="center"> value </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedNeuron.stake.map((row) => (
                              <TableRow key={row[0]}>
                                <TableCell component="th" scope="row" style={{ fontSize: "11px" }}>
                                  {row[0]}
                                </TableCell>
                                <TableCell align="center" style={{ fontSize: "11px" }}>{row[1]}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </>
                }
              </div>
            }
          </>

        }

      </div>

      <Sphere netuid={netuid} setNetUid={setNetUid} onSelect={(n) => {
         setIndex(n.index); 
         setNeurons([...n.all]);
      }} />
    </div>
  );
}

export default App;
