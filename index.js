import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ALGO';
import {
  AppBar, Button, Card, CardContent, FormControl, Grid,
  MenuItem, Select, TextField, Typography,
} from '@material-ui/core';
import {
  Timeline, TimelineItem, TimelineOppositeContent,
  TimelineSeparator, TimelineDot, TimelineConnector,
  TimelineContent
} from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';

reach.setSignStrategy('AlgoSigner');
reach.setProviderByName('TestNet');

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
    return <Transactor {...this.state} />;
  }
}

// Definition of the Transactor participant
class Transactor extends React.Component {
  constructor(props) {
    // props exist here
    console.log("Constructor props:", props);
    super(props);
    this.setState({ transactionRequested: false });
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
    await delay(2000);

    const transactionReq = await new Promise(resolveTransactionReq => {
      this.setState({ transactionRequested: true, resolveTransactionReq });
    });

    this.setState({ transactionRequested: false });
    return transactionReq;
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

  // request interaction
  const transactionRequested = props.transactionRequested;

  // form
  const [supplyName, setSupplyName] = useState(0);
  const [stateName, setStateName] = useState(0);
  const [inventoryUnit, setInventoryUnit] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);

  const [transitionName, setTransitionName] = useState(0);
  const [transitionInvUnit, setTransitionInvUnit] = useState(0);
  const [transitionInvValue, setTransitionInvValue] = useState(0);

  const [deployed, setDeployed] = useState(false);

  let timelineCards = [];
  for (let i = 0; i <= chainState; i++) {
    timelineCards[i] = (
      <TimelineItem key={i}>
        <TimelineOppositeContent>
          {i == 0 ? <></> :
            <>
              <Typography>Transition: {intToTransition[bigNumParse(props.state?.transitions?.[i-1].transitionName)]}</Typography>
              <Typography>
                Inventory: {bigNumParse(props.state?.transitions?.[i-1].inventoryValue)} {intToUnits[bigNumParse(props.state?.transitions?.[i-1].inventoryUnit)]}
              </Typography>
            </>
          }
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>Supply: {intToSupply[bigNumParse(props.state?.states?.[i].supplyName)]}</Typography>
          <Typography>State: {intToState[bigNumParse(props.state?.states?.[i].stateName)]}</Typography>
          <Typography>
            Inventory: {bigNumParse(props.state?.states?.[i].inventoryValue)} {intToUnits[bigNumParse(props.state?.states?.[i].inventoryUnit)]}
          </Typography>
        </TimelineContent>
      </TimelineItem>
    );
  }

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
              {deployed ? <></> :
                <Button
                  onClick={() => {
                    props.setCreateChain(supplyName, stateName, inventoryUnit, inventoryValue);
                    props.deploy();
                    setDeployed(true);
                  }}>
                  Create
                </Button>
              }
              {!transactionRequested ? <></> :
                <>
                  <Typography variant="h6" className={classes.centered} style={{ marginTop: "36px", marginBottom: "8px" }}>
                    Create Transition
                  </Typography>
                  <FormControl style={{ width: "100%" }}>
                    <div>Transition Name</div>
                    <Select value={transitionName} onChange={e => setTransitionName(e.target.value)}>
                      <MenuItem value={0}>Relocation</MenuItem>
                      <MenuItem value={1}>Purchase</MenuItem>
                      <MenuItem value={2}>Processing</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl style={{ width: "100%" }}>
                    <div class={classes.mt1}>Inventory Unit</div>
                    <Select value={transitionInvUnit} onChange={e => setTransitionInvUnit(e.target.value)}>
                      <MenuItem value={0}>Units</MenuItem>
                      <MenuItem value={1}>Kilograms</MenuItem>
                      <MenuItem value={2}>Tons</MenuItem>
                    </Select>
                  </FormControl>
                  <div class={classes.mt1} />
                  <TextField label="Inventory Value" value={transitionInvValue} onChange={e => setTransitionInvValue(e.target.value)} />
                  <Button
                    onClick={() => {
                      props.resolveTransactionReq({
                        transition: {
                          transitionName: transitionName, // isTransition
                          inventoryUnit: transitionInvUnit,  // isUnit
                          inventoryValue: transitionInvValue,
                          date: 0,
                        },
                        state: {
                          supplyName: supplyName,
                          stateName: stateName,
                          inventoryUnit: inventoryUnit,
                          inventoryValue: inventoryValue,
                          date: 0,
                        }
                      });
                    }}>
                    Create
                  </Button>
                </>
              }
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className={classes.centered}>Chain Data:</Typography>
              {!deployed ? <></> :
                <>
                  <Timeline>
                    {timelineCards}
                  </Timeline>
                </>
              }
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
