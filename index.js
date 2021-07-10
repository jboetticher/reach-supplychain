import ReactDOM from 'react-dom';
import React from 'react';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const intToTransition = ["Relocation", "Purchase", "Processing"];
const intToUnits = ["Units", "Kg", "Tons"];
const intToState = ["Production", "Storage", "Usage"];
const intToSupply = ["Lumber", "Concrete", "Steel"];

const { standardUnit, bigNumberToNumber, isBigNumber } = reach;
const bigNumParse = (val) => isBigNumber(val) ? bigNumberToNumber(val) : 0;
const defaults = { defaultFundAmt: '10', defaultWager: '3', standardUnit };

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

    // where to define the original create chain
    this.createChain = {
      supplyName: 0,
      stateName: 0,
      inventoryUnit: 0,
      inventoryValue: 0,
      date: 0,
    };
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
      <>
        <button onClick={this.deploy.bind(this)}
        >
          Begin Deployment
        </button>
        <AppView {...this.state} deploy={this.deploy} />
      </>
    )
  }
}

// What's Displayed
let AppView = props => {
  return (
    <>
      <h3>Chain Data:</h3>
      <div>
        <p>Chain State: {bigNumParse(props.state?.chainState)}</p>
      </div>
    </>
  );
}


ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>,
  document.getElementById('root')
);
