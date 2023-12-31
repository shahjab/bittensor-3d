import React, { useCallback, useEffect, useRef, useState } from "react";


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
import { validators } from './system/library';
import { ClipLoader } from 'react-spinners'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faCircleInfo, faClose, faCopy, faSearch } from "@fortawesome/free-solid-svg-icons";
// import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';

const old_metas = {};

const getInfo = (hotkey) => {
  if (hotkey == "") return {};
  for (let i = 0; i < validators.length; i++) {
    if (validators[i].hotkey == hotkey) {
      return validators[i];
    }
  }
  return { name: "", hotkey, icon: "" };
}

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
  const [isOpenDetails, openDetails] = useState(false);
  const [isOpenDrawer, openDrawer] = useState(false);
  const [isOpenSearch, openSearch] = useState(false);
  const [isOpenHelper, openHelp] = useState(false);
  const [selectedNeuron, selectNeuron] = useState({});
  const [neuronInfo, setNeuronInfo] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [neurons, setNeurons] = useState({ "1": [], "3": [], "11": [] });

  const [validatorAddr, setValidatorAddr] = useState("");

  useEffect(() => {
    if(index < 0)
      return ;
    selectNeuron(neurons[netuid][index]);
    setNeuronInfo(getInfo(neurons[netuid][index]?.hotkey));
    setValidatorAddr(neurons[netuid][index]?.hotkey);
  }, [index])

  const findValidator = (v) => {
    let f = false
    for (let i = 0; i < neurons[netuid].length; i++) {
      if (neurons[netuid][i].hotkey == v.hotkey) {
        setIndex(i);
        openDetails(true);
        f = true;
        // return;
      }
    }
    if(f) return ;
    for (let i = 0; i < old_metas[netuid].length; i++) {
      if (old_metas[netuid][i].hotkey == v.hotkey) {
        setIndex(-1);
        selectNeuron(old_metas[netuid][i]);
        setNeuronInfo(getInfo(old_metas[netuid][i]?.hotkey));
        setValidatorAddr(old_metas[netuid][i]?.hotkey);
        openDetails(true);
      }
    }
  }

  const setInitialNeurons = (data) => {
    old_metas[data[0].netuid] = data;
  } 

  const getUidFromHotkey = useCallback((hotkey) => {
    for(let i=neurons[netuid].length-1; i >=0 ; i--) {
      if(neurons[netuid][i].hotkey == hotkey) {
        return neurons[netuid][i].uid;
      }
    }
    for(let i=0; i < old_metas[netuid]?.length; i++) {
      if(old_metas[netuid][i].hotkey == hotkey) {
        return old_metas[netuid][i].uid;
      }
    }
    return "...";
  }, [neurons[netuid], netuid])

  const getValidator = (hotkey) => {
    for(let i = 0 ;i < validators.length; i++)
      if(String(validators[i].hotkey).toLowerCase() == String(hotkey).toLowerCase())
        return validators[i];
    return false;
  }

  const filter = useCallback(() => {
    const data = [];
    for(let i=0; i < old_metas[netuid]?.length; i++) {
        data[old_metas[netuid][i].uid] = old_metas[netuid][i];
    }
    for(let i=0; i < neurons[netuid].length ; i++) {
        data[neurons[netuid][i].uid] = neurons[netuid][i];
    }
    return data;
  }, [old_metas, neurons[netuid], netuid]);

  const onAddTransactions = (txs) => {
    const tmp = [...transactions, ...txs];
    setTransactions(tmp);
  }

  const [searchString, setSearch] = useState("");
  const [searchType, setSearchType] = useState(1);

  return (
    <div className="w-screen max-h-screen h-screen">
      <div className="absolute z-50 top-[20px] left-[20px] mix-blend-darken h-[80px] w-[80px]">
        <img src="/images/logo.png" alt="" />
      </div>
      
      <div className="absolute z-50 top-[20px] left-[20px] mix-blend-darken h-[80px] w-[80px]">
        <img src="/images/logo.png" alt="" />
      </div>
      <button className="absolute z-50 bottom-[50px] right-[50px]  text-[3rem] text-[#a00000]" onClick={() => openHelp(!isOpenHelper)}>
        <FontAwesomeIcon icon={faCircleInfo} width={50} height={50} />
      </button>
      {isOpenHelper &&
        <div className="rounded-[1rem] bg-white shadow p-[1rem] flex flex-col absolute bottom-[120px] right-[50px] min-w-[20rem]">
          <p className="font-bold"> Neurons </p>

          <div className="flex">
            <div className="mr-[2rem]">
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[#87CEEB] rounded-full mr-[1rem]"></span> Validators
              </div>
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[#FA8072] rounded-full mr-[1rem]"></span> Miners
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[#ffff00] rounded-full mr-[1rem]"></span> Search results
              </div>
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[white] rounded-full mr-[1rem] border-[1px] border-[gray]"></span> Selected
              </div>
            </div>
          </div>

          <div className="min-h-[1px] bg-[gray] my-[0.5rem]"></div>
          <p className="font-bold"> Lines </p>
          <div className="flex">
            <div className="mr-[2rem]">
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[#87CEEB] rounded-full mr-[1rem]"></span> Validators (Inner orbit)
              </div>
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[#FA8072] rounded-full mr-[1rem]"></span> Miners (Outer orbit)
              </div>
              <div className="flex items-center">
                <span className="min-w-[20px] min-h-[20px] bg-[white] rounded-full mr-[1rem] border-[1px] border-[gray]"></span> Miner/Validator
              </div>
            </div>
          </div>
          {/* <div className="bg-gradient-to-r from-[#ff0000] to-[#00ff00] rounded-full min-h-[0.5rem] shadow-sm my-[0.25rem]">
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <p> Oldest </p>
            <p> New </p>
          </div> */}
        </div>
      }
      {isOpenDrawer == 0 &&
        <button className="fixed origin-center rotate-90 rounded-t-[1rem] top-[170px] -left-[55px] bg-white border-[1px] border-[gray] px-[1.25rem] pt-[0.5rem] pb-[0.25rem]"
          onClick={() => { openDrawer(1) }}
        >
          Top Validators
          {/* <FontAwesomeIcon icon={faAngleRight} width={24} height={24}/>   */}
        </button>
      }

      {isOpenDrawer == 0 &&
        <button className="fixed origin-center rotate-90 rounded-t-[1rem] top-[330px] -left-[72px] bg-white border-[1px] border-[gray] px-[1.25rem] pt-[0.5rem] pb-[0.25rem]"
          onClick={() => { openDrawer(2) }}
        >
          Latest Transactions
          {/* <FontAwesomeIcon icon={faAngleRight} width={24} height={24}/>   */}
        </button>
      }

      {isOpenDrawer == 0 &&
        <button className="fixed origin-center rotate-90 rounded-t-[1rem] top-[477px] -left-[42px] bg-white border-[1px] border-[gray] px-[1.25rem] pt-[0.5rem] pb-[0.25rem] flex items-center"
          onClick={() => { openDrawer(3) }}
        >
          <p>Search</p>
          <FontAwesomeIcon icon={faSearch} width={24} height={24}/>  
        </button>
      }

      <div className="absolute w-[360px] min-h-[calc(100vh-140px)] bg-white top-[120px] rounded-[1rem] rounded-l-[0px] flex flex-col p-[1rem] shadow transition-all duration-700" style={{ left: isOpenDrawer == 1 ? 0 : "-360px" }}>
        <h4 className="text-[1.25rem] font-bold"> Top Validators </h4>
        <div className="flex flex-col overflow-y-auto mt-[1.5rem] max-h-[calc(100vh-240px)]">
          <button className="absolute w-[30px] h-[30px] rounded top-[20px] right-[15px] bg-white border-[1px] border-[gray]"
            onClick={() => { openDrawer(0) }}
          >
            <FontAwesomeIcon icon={faClose} width={24} height={24} />
          </button>
          {validators.filter((item) => getUidFromHotkey(item.hotkey) != "...").map((validator) =>
            <button key={validator.hotkey} className="flex mb-[0.5rem] hover:bg-[lightgray]" style={{ backgroundColor: neuronInfo?.hotkey == validator.hotkey ? "lightblue" : "white" }}
              onClick={() => { findValidator(validator) }}
            >
              <div className="w-[80px] max-h-[80px] rounded flex justify-center items-center p-[0.25rem]" style={{backgroundColor: validator.icon.length ? "black" : "transparent"}}>
                {validator.icon.length > 0 &&
                  <img alt={validator.name} src={validator.icon} />
                }
              </div>
              <div className="flex flex-col px-[0.5rem] mr-[1rem]">
                <p className="font-bold text-[14px] text-left"> {validator.name}</p>
                <p className="text-[11px] text-left"> hotkey: <span className="font-bold">{validator.hotkey.substring(0, 5)}...{validator.hotkey.substring(validator.hotkey.length - 3)} </span> <span className="px-[0.25rem] rounded-full bg-[green] text-white font-bold text-[12px]"> UID: { getUidFromHotkey(validator.hotkey) } </span></p>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="absolute w-[360px] min-h-[calc(100vh-140px)] bg-white top-[120px] rounded-[1rem] rounded-l-[0px] flex flex-col p-[1rem] shadow transition-all duration-700" style={{ left: isOpenDrawer == 2 ? 0 : "-360px" }}>
        <h4 className="text-[1.25rem] font-bold"> Latest Transactions </h4>
        <div className="flex flex-col overflow-y-auto overflow-x-hidden mt-[1.5rem] max-h-[calc(100vh-240px)]">
          <button className="absolute w-[30px] h-[30px] rounded top-[20px] right-[15px] bg-white border-[1px] border-[gray] border-b-[1px] border-[gray]"
            onClick={() => { openDrawer(0) }}
          >
            <FontAwesomeIcon icon={faClose} width={24} height={24} />
          </button>
          { transactions.length == 0 && 
            <div className="flex items-center">
              <ClipLoader />
              <p> Loading ... </p>
            </div>
          }
          {transactions.map((tx) =>
            <button key={tx.hash} className="flex mb-[0.5rem] hover:bg-[#e0e0f0] mr-[0.5rem] p-[0.5rem] rounded-[0.25rem] border-b-[1px] border-b-[gray] hover:shadow"
              // onClick={() => {
              //   window.open(`https://explorer.finney.opentensor.ai/#/explorer/query/${tx.hash}`, "_blank")
              // }}
            >
              <div className="flex flex-col px-[0.5rem] text-left text-[11px] whitespace-nowrap overflow-hidden">
                <p> Method: <span className="font-bold mr-[1rem]">{tx.method}</span> Block: <span className="font-bold">{tx.block}</span>
                </p>
                <p> Signed by <span className="font-bold">{String(tx.signer).substring(0,7)}...{String(tx.signer).substring(tx.signer.length - 3)}</span>
                  <FontAwesomeIcon icon={faCopy} width={16} height={16} className="ml-[0.5rem] hover:text-[gray]"
                    onClick={async () => { 
                      await navigator.clipboard.writeText(tx.signer)
                    }}
                  />
                </p>
                <p> Extrinsic: <span className="font-bold">{String(tx.hash).substring(0,9)}...{String(tx.hash).substring(tx.hash.length - 4)}</span> <FontAwesomeIcon icon={faCopy} width={16} height={16} className="mx-[0.25rem] hover:text-[gray]"
                    onClick={async () => { 
                      await navigator.clipboard.writeText(tx.hash)
                    }}
                  /></p>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="absolute w-[360px] min-h-[calc(100vh-140px)] bg-white top-[120px] rounded-[1rem] rounded-l-[0px] flex flex-col p-[1rem] shadow transition-all duration-700" style={{ left: isOpenDrawer == 3 ? 0 : "-360px" }}>
        <div className="rounded-[1rem] bg-[white] border-[1px] border-[#808080] shadow flex items-center h-[60px] text-black leading-[50px] px-[1rem]">
          <input className="" type="text" value={searchString} onChange={(e) => setSearch(e.target.value)} className="outline-none" placeholder="Search ..." />
          
          <button className="border-[1px] rounded border-[#e0e0e0] text-[12px] leading-[12px] h-[24px] px-[6px] mr-[4px]" onClick={() => { setSearchType(1) }} style={{ backgroundColor: searchType == 1 ? "#e0e0e0" : "white" }}> UID </button>
          <button className="border-[1px] rounded border-[#e0e0e0] text-[12px] leading-[12px] h-[24px] px-[6px]" onClick={() => { setSearchType(2) }} style={{ backgroundColor: searchType == 2 ? "#e0e0e0" : "white" }}> Hotkey </button>
          <button className="border-[1px] rounded min-w-[20px] h-[20px] border-[#505050] text-[12px] leading-[12px] h-[24px] mr-[4px] ml-[0.5rem]" onClick={() => { openDrawer(0) }}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="flex flex-col overflow-y-auto overflow-x-hidden mt-[1.5rem] max-h-[calc(100vh-240px)]">
          {/* <button className="absolute w-[30px] h-[30px] rounded top-[20px] right-[15px] bg-white border-[1px] border-[gray] border-b-[1px] border-[gray]"
            onClick={() => { openDrawer(0) }}
          >
            <FontAwesomeIcon icon={faClose} width={24} height={24} />
          </button> */}
          {/* { neurons[netuid].filter((item) => { 
            if(searchType == 1) {
              return item.uid == searchString;
            } else {
              return String(item.hotkey).includes(searchString)
            }
          }).length == 0 && 
            <div className="flex items-center">
              <p>  </p>
            </div>
          } */}
          { filter().filter((item) => { 
            if(searchType == 1) {
              return ("" + item.uid) == searchString;
            } else {
              return String(String(item.hotkey).toLowerCase()).includes(searchString.toLowerCase())
            }
          }).map((neuron) => {
            const v = getValidator(neuron.hotkey);
            return v ?
            <button key={v.hotkey} className="flex mb-[0.5rem] hover:bg-[lightgray]" style={{ backgroundColor: neuronInfo?.hotkey == v.hotkey ? "lightblue" : "white" }}
              onClick={() => { findValidator(v) }}
            >
              <div className="w-[80px] max-h-[80px] rounded flex justify-center items-center p-[0.25rem]" style={{backgroundColor: String(v.icon).length ? "black" : "transparent"}}>
                {String(v.icon).length > 0 &&
                  <img alt={v.name} src={v.icon} />
                }
              </div>
              <div className="flex flex-col px-[0.5rem] mr-[1rem]">
                <p className="font-bold text-[14px] text-left"> {v.name}</p>
                <p className="text-[11px] text-left"> hotkey: <span className="font-bold">{neuron.hotkey.substring(0, 5)}...{neuron.hotkey.substring(String(neuron.hotkey).length - 3)} </span> <span className="px-[0.25rem] rounded-full bg-[green] text-white font-bold text-[12px]"> UID: { getUidFromHotkey(v.hotkey) } </span></p>
              </div>
            </button> :
            // <button key={neuron.hotkey} className="flex mb-[0.5rem] hover:bg-[lightgray]" onClick={() => {
            //   setSearch("" + neuron.uid); setSearchType(1);
            // }}
            // >
            //   <div className="flex flex-col px-[0.5rem] mr-[1rem] text-left text-[11px] whitespace-nowrap">
            //     <p> UID: {neuron.uid}</p>
            //     <p> HOTKEY: {neuron.hotkey}</p>
            //   </div>
            // </button> : 
            <button key={neuron.hotkey} className="flex mb-[0.5rem] hover:bg-[lightgray] rounded-[0.5rem] p-[0.5rem]" onClick={() => {
              findValidator(neuron);
            }}
            >
              <div className="flex flex-col px-[0.5rem] mr-[1rem] text-left text-[11px] whitespace-nowrap">
                <p className="text-[11px] text-left"> hotkey: <span className="font-bold">{neuron.hotkey.substring(0, 5)}...{neuron.hotkey.substring(String(neuron.hotkey).length - 3)} </span> <span className=" ml-[0.5rem] px-[0.25rem] rounded-full bg-[green] text-white font-bold text-[12px]"> UID: {  neuron.uid } </span></p>
              </div>
            </button>
          }
          )}
        </div>
      </div>

      <div className="absolute flex flex-col right-[20px] top-[20px] w-[500px] p-[1rem] rounded-[1rem] z-50 bg-[#ffffff] shadow">
        <div style={{ display: "flex", alignItems: "center" }}>
          <p className="mr-[0.5rem]"> Netuid </p>
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
          {neurons[netuid]?.length < 1 &&
            <ClipLoader/>
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
                <Button onClick={() => { index < neurons[netuid].length - 1 && setIndex(index + 1) }}>NEXT</Button>
              </ButtonGroup>
            </div>
            {isOpenDetails &&
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Divider style={{ marginTop: "5px", marginBottom: "5px", }} />
                {/* <p style={{ marginBottom: "5px", marginTop: "5px" }}> Block: {selectedNeuron.last_update} </p> */}
                {neuronInfo?.icon.length > 0 &&
                  <div className="bg-black rounded-[1rem] max-h-[100px] flex justify-center p-[0.25rem]">
                    <img alt={neuronInfo.name} src={neuronInfo.icon} className="max-h-[100px]" />
                  </div>
                }
                {neuronInfo?.name.length > 0 &&
                  <p style={{ fontSize: 24, fontWeight: 600, marginBottom: "5px", }}> {neuronInfo.name} </p>
                }
                <p className="mb-[10px] mt-[0px]"> hotkey: <span className="text-[12px]"> {selectedNeuron.hotkey} </span></p>
                {/* <p style={{ marginBottom: "5px", marginTop: "5px" }}> coldkey: <span className="text-[12px]"> {selectedNeuron.coldkey} </span></p> */}
                <Button variant="outlined" size="small" onClick={() => { openStakeDetails(!isOpenStake) }}>
                  {isOpenStake ? "Close" : "Open"} Stake
                </Button>
                {isOpenStake &&
                  <>
                <Divider style={{ marginBottom: "5px", marginTop: "5px" }}/>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                                <TableCell align="center" style={{ fontSize: "11px" }}>{(row[1]/10**10).toFixed(3)}</TableCell>
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
        const tmp = neurons;
        tmp[n.netuid] = n.all
        if (n.all.length == 0) {
          setLoading(true);
        } else {
          setLoading(false)
        }
        setNeurons({ ...tmp });
      }} setTransactions={onAddTransactions} neurons={neurons} validatorAddr={validatorAddr} searchString={searchString} searchType={searchType} setInitialNeurons={setInitialNeurons} />
    </div>
  );
}

export default App;
