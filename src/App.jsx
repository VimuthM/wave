import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [totalWaves, setTotalWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState('');
	const contractAddress = '0x5105b84618e0b97BBFe2ba04FA1A0c302Af8D01E';
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);

        const provider = new ethers.providers.Web3Provider(ethereum);
  			const signer = provider.getSigner();
  			const wavePortalContract = new ethers.Contract(
  				contractAddress,
  				contractABI,
  				signer
  			);
        
        let count = await wavePortalContract.getTotalWaves();
  			console.log('Retrieved total wave count...', count.toNumber());
  			setTotalWaves(count.toNumber());

        await getAllWaves();
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);

			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);

			let count = await wavePortalContract.getTotalWaves();
			console.log('Retrieved total wave count...', count.toNumber());
			setTotalWaves(count.toNumber());
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
				setTotalWaves(count.toNumber());

				const waveTxn = await wavePortalContract.wave(message == "" ? "empty :(" : message);
				console.log('Mining...', waveTxn.hash);

				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
				setTotalWaves(count.toNumber());

        await getAllWaves();
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateMessage = (e) => {
    setMessage(e.target.value);
  }
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>

				<div className="bio">
					I am Vimuth and I'm just getting started on web3 so that's pretty cool
					right? Connect your Ethereum wallet and wave at me!
				</div>

        <br></br>
				<div className="total" style={{ alignSelf: "center" }}>
          Total waves so far: {totalWaves}
        </div>

        <div className="container">
          <input className="input" type="text" onChange={updateMessage}></input>
  				<button className="waveButton" onClick={wave}>
  					Wave at Me!
  				</button>
        </div>

				{!currentAccount && (
					<button className="connectButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
			</div>
		</div>
	);
};

export default App;
