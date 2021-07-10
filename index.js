import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';
import {
  AppBar, Button, Card, CardContent, CardHeader,
  Grid, Select, TextField, Typography, MenuItem, InputLabel, FormControl
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const { standardUnit, bigNumberToNumber, isBigNumber } = reach;
const bigNumParse = (val) => isBigNumber(val) ? bigNumberToNumber(val) : 0;
const defaults = { defaultFundAmt: '10', defaultWager: '3', standardUnit };

const intToTransition = ["Relocation", "Purchase", "Processing"];
const intToUnits = ["Units", "Kg", "Tons"];
const intToState = ["Production", "Storage", "Usage"];
const intToSupply = ["Lumber", "Concrete", "Steel"];

//#region Setup Classes

// Root App
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...defaults };
  }

  async componentDidMount() {
    console.log("Component mounting...");
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({ acc, bal });

    // Removed faucet functionality. Unnecessary for quick implementation
    /*
    try {
      const faucet = await reach.getFaucet();
      this.setState({view: 'FundAccount', faucet});
    } catch (e) {
      this.setState({view: 'DeployerOrAttacher'});
    }
    */
    console.log("Component mounted.", this.state);
  }

  // Removed faucet functionality.
  /*
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'DeployerOrAttacher'});
  }
  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }
  */


  render() {
    return <Transactor {...this.state} damn={"damn"} />;
  }
}

// Definition of the Transactor participant
class Transactor extends React.Component {
  constructor(props) {
    // props exist here
    console.log("Constructor props:", props);
    super(props);
  }

  random() { return reach.hasRandom.random(); }

  async deploy() {
    // props don't exist here
    const ctc = this.props.acc.deploy(backend);

    backend.Alice(ctc, this);
    console.log("Alice deployment complete.");

    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    console.log("Connection String: ", ctcInfoStr);
  }

  viewData(data) {
    console.log(data);
    this.setState({ state: data });
  }

  async createTransaction() {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(5000);

    return {
      transition: {
        transitionName: 0, // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      },
      state: {
        supplyName: 0,
        stateName: 0,
        inventoryUnit: 0,
        inventoryValue: 0,
        date: 0,
      }
    }
  }

  setCreateChain(supplyName, stateName, inventoryUnit, inventoryValue) {
    // where to define the original create chain
    this.createChain = {
      supplyName: supplyName,
      stateName: stateName,
      inventoryUnit: inventoryUnit,
      inventoryValue: inventoryValue,
      date: 0,
    };
  }



  // example of user interaction
  async getHand() { // Fun([], UInt)
    const hand = await new Promise(resolveHandP => {
      this.setState({ view: 'GetHand', playable: true, resolveHandP });
    });
    this.setState({ view: 'WaitingForResults', hand });
    return hand;
  }

  render() {
    return (
      <AppView {...this.state} deploy={this.deploy.bind(this)} setCreateChain={this.setCreateChain.bind(this)} />
    )
  }
}

//#endregion

const useStyles = makeStyles({
  appBar: {
    padding: "8px",
  },
  gridGutter: {
    padding: "16px"
  },
  centered: {
    textAlign: "center"
  },
  mt1: {
    marginTop: "12px"
  },
  mt2: {
    marginTop: "24px"
  },
  mt3: {
    marginTop: "36px"
  }
});

// What's Displayed
let AppView = props => {
  const classes = useStyles();
  const chainState = bigNumParse(props.state?.chainState);

  // states
  const supplyNameD = bigNumParse(props.state?.states?.[0].supplyName);
  const stateNameD = bigNumParse(props.state?.states?.[0].stateName);
  const inventoryUnitD = bigNumParse(props.state?.states?.[0].inventoryUnit);
  const inventoryValueD = bigNumParse(props.state?.states?.[0].inventoryValue);

  const [supplyName, setSupplyName] = useState(0);
  const [stateName, setStateName] = useState(0);
  const [inventoryUnit, setInventoryUnit] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const date = 0;

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        <Typography variant="h6">Algorand Construction Supply Chain</Typography>
      </AppBar>
      <Grid container spacing={3} className={`mt-4 ${classes.gridGutter}`}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className={classes.centered} style={{ marginBottom: "8px" }}>
                Create Supply State
              </Typography>
              <FormControl style={{ width: "100%" }}>
                <div>Supply Resource</div>
                <Select value={supplyName} onChange={e => setSupplyName(e.target.value)}>
                  <MenuItem value={0}>Lumber</MenuItem>
                  <MenuItem value={1}>Concrete</MenuItem>
                  <MenuItem value={2}>Steel</MenuItem>
                </Select>
              </FormControl>
              <FormControl style={{ width: "100%" }}>
                <div class={classes.mt1}>Supply State</div>
                <Select value={stateName} onChange={e => setStateName(e.target.value)}>
                  <MenuItem value={0}>Production</MenuItem>
                  <MenuItem value={1}>Storage</MenuItem>
                  <MenuItem value={2}>Usage</MenuItem>
                </Select>
              </FormControl>
              <FormControl style={{ width: "100%" }}>
                <div class={classes.mt1}>Unit</div>
                <Select value={inventoryUnit} onChange={e => setInventoryUnit(e.target.value)}>
                  <MenuItem value={0}>Units</MenuItem>
                  <MenuItem value={1}>Kilograms</MenuItem>
                  <MenuItem value={2}>Tons</MenuItem>
                </Select>
              </FormControl>
              <div class={classes.mt1} />
              <TextField label="Value" value={inventoryValue} onChange={e => setInventoryValue(e.target.value)} />
              <Button
                onClick={() => {
                  props.setCreateChain(supplyName, stateName, inventoryUnit, inventoryValue);
                  props.deploy();
                }}>
                Create
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className={classes.centered}>Chain Data:</Typography>
              <Typography>Supply Name: {supplyNameD}</Typography>
              <Typography>State Name: {stateNameD}</Typography>
              <Typography>Inventory Unit: {inventoryUnitD}</Typography>
              <Typography>Inventory Value: {inventoryValueD}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}


ReactDOM.render(
  <React.StrictMode>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
