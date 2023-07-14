import '@polkadot/api-augment';
import { ApiPromise } from "@polkadot/api/promise/Api";
import { WsProvider } from "@polkadot/rpc-provider/ws";
import { MetadataVersioned } from '@polkadot/types/metadata/MetadataVersioned';
import { formatBalance } from '@polkadot/util';
import axios from "axios";
import { useDispatch } from 'react-redux';
import { useUtil } from '../../store/hook';
import { setNeurons } from '../../store/slices/utilSlice';

const block_time = 12; // seconds
const difficultyFormatter = Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 2 });

const balanceFormatter = (balance_num) => formatBalance(
  balance_num,
  { withSi: false, forceUnit: 'TAO', decimals: 9 }
);
const halving_block = 10.5e6; // block 10.5M is the halvening

function get_provider_from_url(url) {
  const provider = new WsProvider(url);
  return provider;
}

export async function get_api_from_url(url) {
  const provider = get_provider_from_url(url);
  const api = await ApiPromise.create({
    types: {
      Balance: 'u64',
      PrometheusInfo: {
        block: 'u64', // --- Prometheus serving block.
        version: 'u32', // --- Prometheus version.
        ip: 'u128', // --- Prometheus u128 encoded ip address of type v6 or v4. serialized to string.
        port: 'u16', // --- Prometheus u16 encoded port.
        ip_type: 'u8', // --- Prometheus ip type, 4 for ipv4 and 6 for ipv6.
      },
      AxonInfo: {
        block: 'u64', // --- Axon serving block.
        version: 'u32', // --- Axon version
        ip: 'u128', // --- Axon u128 encoded ip address of type v6 or v4. serialized to string.
        port: 'u16', // --- Axon u16 encoded port.
        ip_type: 'u8', // --- Axon ip type, 4 for ipv4 and 6 for ipv6.
        protocol: 'u8', // --- Axon protocol. TCP, UDP, other.
        placeholder1: 'u8', // --- Axon proto placeholder 1.
        placeholder2: 'u8', // --- Axon proto placeholder 1.
      },
      NeuronInfo: {
        hotkey: 'AccountId',
        coldkey: 'AccountId',
        uid: 'Compact<u16>',
        netuid: 'Compact<u16>',
        active: 'bool',
        axon_info: 'AxonInfo',
        prometheus_info: 'PrometheusInfo',
        stake: 'Vec<(AccountId, Compact<u64>)>', // map of coldkey to stake on this neuron/hotkey (includes delegations)
        rank: 'Compact<u16>',
        emission: 'Compact<u64>',
        incentive: 'Compact<u16>',
        consensus: 'Compact<u16>',
        trust: 'Compact<u16>',
        validator_trust: 'Compact<u16>',
        dividends: 'Compact<u16>',
        last_update: 'Compact<u64>',
        validator_permit: 'bool',
        weights: 'Vec<(Compact<u16>, Compact<u16>)>', // Vec of (uid, weight)
        bonds: 'Vec<(Compact<u16>, Compact<u16>)>', // Vec of (uid, bond)
        pruning_score: 'Compact<u16>'
      },
      NeuronInfoLite: {
        hotkey: 'AccountId',
        coldkey: 'AccountId',
        uid: 'Compact<u16>',
        netuid: 'Compact<u16>',
        active: 'bool',
        axon_info: 'AxonInfo',
        prometheus_info: 'PrometheusInfo',
        stake: 'Vec<(AccountId, Compact<u64>)>', // map of coldkey to stake on this neuron/hotkey (includes delegations)
        rank: 'Compact<u16>',
        emission: 'Compact<u64>',
        incentive: 'Compact<u16>',
        consensus: 'Compact<u16>',
        trust: 'Compact<u16>',
        validator_trust: 'Compact<u16>',
        dividends: 'Compact<u16>',
        last_update: 'Compact<u64>',
        validator_permit: 'bool',
        pruning_score: 'Compact<u16>'
      },
      DelegateInfo: {
        delegate_ss58: 'AccountId',
        take: 'Compact<u16>',
        nominators: 'Vec<(AccountId, Compact<u64>)>', // map of nominator_ss58 to stake amount
        owner_ss58: 'AccountId',
        registrations: 'Vec<Compact<u16>>', // Vec of netuid this delegate is registered on
        validator_permits: 'Vec<Compact<u16>>', // Vec of netuid this delegate has validator permit on
        return_per_1000: 'Compact<u64>', // Delegators current daily return per 1000 TAO staked minus take fee
        total_daily_return: 'Compact<u64>', // Delegators current daily return
      },
      SubnetInfo: {
        netuid: 'Compact<u16>',
        rho: 'Compact<u16>',
        kappa: 'Compact<u16>',
        difficulty: 'Compact<u64>',
        immunity_period: 'Compact<u16>',
        validator_batch_size: 'Compact<u16>',
        validator_sequence_length: 'Compact<u16>',
        validator_epochs_per_reset: 'Compact<u16>',
        validator_epoch_length: 'Compact<u16>',
        max_allowed_validators: 'Compact<u16>',
        min_allowed_weights: 'Compact<u16>',
        max_weights_limit: 'Compact<u16>',
        scaling_law_power: 'Compact<u16>',
        synergy_scaling_law_power: 'Compact<u16>',
        subnetwork_n: 'Compact<u16>',
        max_allowed_uids: 'Compact<u16>',
        blocks_since_last_step: 'Compact<u64>',
        tempo: 'Compact<u16>',
        network_modality: 'Compact<u16>',
        network_connect: 'Vec<[u16; 2]>',
        emission_values: 'Compact<u64>',
        burn: 'Compact<u64>',
      }
    },
    rpc: {
      neuronInfo: {
        getNeuronsLite: {
          description: 'Get neurons lite',
          params: [
            {
              name: 'netuid',
              type: 'u16',
            }
          ],
          type: 'Vec<u8>',
        },
        getNeuronLite: {
          description: 'Get neuron lite',
          params: [
            {
              name: 'netuid',
              type: 'u16',
            },
            {
              name: 'uid',
              type: 'u16',
            }
          ],
          type: 'Vec<u8>',
        },
        getNeurons: {
          description: 'Get neurons',
          params: [
            {
              name: 'netuid',
              type: 'u16',
            }
          ],
          type: 'Vec<u8>',
        },
        getNeuron: {
          description: 'Get neuron',
          params: [
            {
              name: 'netuid',
              type: 'u16',
            },
            {
              name: 'uid',
              type: 'u16',
            }
          ],
          type: 'Vec<u8>',
        },
      },
      delegateInfo: {
        getDelegates: {
          description: 'Get delegates info',
          params: [],
          type: 'Vec<u8>',
        },
      },
      subnetInfo: {
        getSubnetsInfo: {
          description: 'Get subnets info',
          params: [],
          type: 'Vec<u8>',
        },
        getSubnetInfo: {
          description: 'Get subnet info',
          params: [
            {
              name: 'netuid',
              type: 'u16',
            }
          ],
          type: 'Vec<u8>',
        },
      },
    },
    provider: provider,
  });
  return api;
}

async function getNeurons(api, netuid) {
  return new Promise((resolve, reject) => {
    (api.rpc).neuronInfo.getNeuronsLite(netuid)
      .then((neurons_bytes) => {
        let neurons = api.createType('Vec<NeuronInfoLite>', neurons_bytes);
        resolve(neurons.toJSON());
      })
      .catch((err) => {
        reject(err);
      });
  })
};

async function getDifficulties(api) {
  const netuids = await getNetuids(api);
  let difficulty = {};
  for (let netuid of netuids) {
    const diff = (await (api.query.subtensorModule).difficulty(netuid)).toNumber();
    difficulty[netuid.toString()] = diff;
  }
  return difficulty;
}

async function getDifficulty(api, netuid) {
  return (await (api.query.subtensorModule).difficulty(netuid)).toNumber();
}

async function getBurnAmounts(api) {
  const netuids = await getNetuids(api);
  let burn_amounts = {};
  for (let netuid of netuids) {
    const diff = (await (api.query.subtensorModule).burn(netuid)).toNumber();
    burn_amounts[netuid.toString()] = diff;
  }
  return burn_amounts;
}

async function getBurnAmount(api, netuid) {
  return (await (api.query.subtensorModule).burn(netuid)).toNumber();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function getNetuids(api) {
  let subnets_info_bytes = await (api.rpc).subnetInfo.getSubnetsInfo();
  let subnets_info = api.createType('Vec<Option<SubnetInfo>>', subnets_info_bytes);
  let netuids = subnets_info.toJSON().map((subnet_info) => { return subnet_info.netuid });
  return netuids;
}

async function refreshMeta(api, netuid) {
  let _neurons = {};
  const result = await getNeurons(api, netuid)
  let neurons_ = result.map((neuron, j) => {
    return neuron
  });
  _neurons = neurons_;

  return _neurons;
}

async function getLatestBlock(api) {

  // Fetch the latest block
  const latestHeader = await api.rpc.chain.getHeader();
  const blockNumber = latestHeader.number.toNumber();

  return blockNumber;
}

export async function watch(api, netuid, onUpdate) {
  let neurons = [];

  let old_meta;
  old_meta = await refreshMeta(api, netuid);

  let startBlock = 0;
  let sorted_meta = old_meta.sort((a, b) => b.last_update - a.last_update);
  neurons = sorted_meta.slice(0, 50);
  startBlock = neurons[0].last_update;
  neurons = neurons.reverse();
  onUpdate(netuid, neurons)

  while (true) {
    await sleep(10000)
    const new_meta = await refreshMeta(api, netuid);
    let tmp = JSON.parse(JSON.stringify(neurons));

    let max = startBlock;
    let f = false;
    new_meta.map((meta) => {
      if (meta.last_update > startBlock) {
        tmp.push(meta);
        f = true;
      }
      if (meta.last_update > max)
        max = meta.last_update

      startBlock = max;
    })
    if (f) {
      neurons = tmp;
      onUpdate(netuid, tmp)
    }
  }
}