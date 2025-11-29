// Ensure exactly one .page is active on initial load
document.addEventListener('DOMContentLoaded', () => {
	const pages = Array.from(document.querySelectorAll('.page'));
	const actives = pages.filter((p) => p.classList.contains('active'));
	if (actives.length !== 1) {
		pages.forEach((p) => p.classList.remove('active'));
		const home = document.getElementById('page-home');
		if (home) home.classList.add('active');
		else if (pages[0]) pages[0].classList.add('active');
	}
});

// ================== DATE & TIME ==================
function updateDateTime() {
	const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
	const months = [
		'Januari',
		'Februari',
		'Maret',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Agustus',
		'September',
		'Oktober',
		'November',
		'Desember',
	];
	const now = new Date(
		new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
	);
	const dayName = days[now.getDay()];
	const date = now.getDate();
	const month = months[now.getMonth()];
	const year = now.getFullYear();
	const hh = now.getHours().toString().padStart(2, '0');
	const mm = now.getMinutes().toString().padStart(2, '0');
	const ss = now.getSeconds().toString().padStart(2, '0');
	document.getElementById(
		'datetime'
	).textContent = `${dayName}, ${date} ${month} ${year} (${hh}:${mm}:${ss} WIB)`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ================== SHA-256 ==================
async function sha256(msg) {
	const enc = new TextEncoder();
	const buf = await crypto.subtle.digest('SHA-256', enc.encode(msg));
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ================== NAVIGATION ==================
function showPage(pageId) {
	document
		.querySelectorAll('.page')
		.forEach((p) => p.classList.remove('active'));
	document.getElementById(pageId).classList.add('active');
	window.scrollTo(0, 0);
}

// ================== HASH PAGE ==================
document.getElementById('hash-input').addEventListener('input', async (e) => {
	document.getElementById('hash-output').textContent = await sha256(
		e.target.value
	);
});

// ================== BLOCK PAGE ==================
const blockData = document.getElementById('block-data');
const blockNonce = document.getElementById('block-nonce');
const blockHash = document.getElementById('block-hash');
const blockTimestamp = document.getElementById('block-timestamp');
const speedControl = document.getElementById('speed-control');

blockNonce.addEventListener('input', (e) => {
	e.target.value = e.target.value.replace(/[^0-9]/g, '');
	updateBlockHash();
});
blockData.addEventListener('input', updateBlockHash);

async function updateBlockHash() {
	const data = blockData.value;
	const nonce = blockNonce.value || '0';
	blockHash.textContent = await sha256(data + nonce);
}

document.getElementById('btn-mine').addEventListener('click', async () => {
	const data = blockData.value;
	const speedMultiplier = parseInt(speedControl.value) || 1;
	const baseBatch = 1000;
	const batchSize = baseBatch * speedMultiplier;
	const difficulty = '0000';
	const status = document.getElementById('mining-status');
	const timestamp = new Date().toLocaleString('en-US', {
		timeZone: 'Asia/Jakarta',
	});
	blockTimestamp.value = timestamp;
	blockHash.textContent = '';
	blockNonce.value = '0';
	let nonce = 0;
	if (status) status.textContent = 'Mining...';
	async function mineStep() {
		const promises = [];
		for (let i = 0; i < batchSize; i++) {
			promises.push(sha256(data + timestamp + (nonce + i)));
		}
		const results = await Promise.all(promises);
		for (let i = 0; i < results.length; i++) {
			const h = results[i];
			if (h.startsWith(difficulty)) {
				blockNonce.value = nonce + i;
				blockHash.textContent = h;
				if (status)
					status.textContent = `✓ Mining Complete (Nonce=${nonce + i})`;
				return;
			}
		}
		nonce += batchSize;
		blockNonce.value = nonce;
		if (status) status.textContent = `Mining...  Nonce=${nonce}`;
		setTimeout(mineStep, 0);
	}
	mineStep();
});

// ================== BLOCKCHAIN PAGE ==================
const ZERO_HASH = '0'.repeat(64);
let blocks = [];
const chainDiv = document.getElementById('blockchain');

function renderChain() {
	chainDiv.innerHTML = '';
	blocks.forEach((blk, i) => {
		const div = document.createElement('div');
		div.className =
			'bg-gradient-to-b from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 shadow-md';
		div.innerHTML = `
      <h3 class="font-bold text-lg text-green-700 mb-3"><i class="fas fa-cube mr-2"></i>Block #${blk.index}</h3>
      <div class="space-y-3">
        <div>
          <label class="text-xs font-semibold text-gray-700">Previous Hash:</label>
          <div class="bg-white border border-gray-300 rounded p-2 text-xs font-mono break-all text-gray-700 mt-1">${blk.previousHash}</div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-700">Data:</label>
          <textarea class="w-full px-2 py-1 border border-gray-300 rounded text-xs mt-1" rows="2" onchange="onChainDataChange(${i},this.value)">${blk.data}</textarea>
        </div>
        <button onclick="mineChainBlock(${i})" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition-colors duration-200">
          <i class="fas fa-hammer mr-2"></i>Mine
        </button>
        <div id="status-${i}" class="text-xs font-semibold text-blue-600"></div>
        <div>
          <label class="text-xs font-semibold text-gray-700">Timestamp:</label>
          <div class="bg-white border border-gray-300 rounded p-2 text-xs font-mono text-gray-700 mt-1" id="timestamp-${i}">${blk.timestamp}</div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-700">Nonce:</label>
          <div class="bg-white border border-gray-300 rounded p-2 text-xs font-mono text-gray-700 mt-1" id="nonce-${i}">${blk.nonce}</div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-700">Hash:</label>
          <div class="bg-white border border-gray-300 rounded p-2 text-xs font-mono break-all text-gray-700 mt-1" id="hash-${i}">${blk.hash}</div>
        </div>
      </div>
    `;
		chainDiv.appendChild(div);
	});
}

function addChainBlock() {
	const idx = blocks.length;
	const prev = idx ? blocks[idx - 1].hash : ZERO_HASH;
	const blk = {
		index: idx,
		data: '',
		previousHash: prev,
		timestamp: '',
		nonce: 0,
		hash: '',
	};
	blocks.push(blk);
	renderChain();
}

window.onChainDataChange = function (i, val) {
	blocks[i].data = val;
	blocks[i].nonce = 0;
	blocks[i].timestamp = '';
	blocks[i].hash = '';
	for (let j = i + 1; j < blocks.length; j++) {
		blocks[j].previousHash = blocks[j - 1].hash;
		blocks[j].nonce = 0;
		blocks[j].timestamp = '';
		blocks[j].hash = '';
	}
	renderChain();
};

window.mineChainBlock = function (i) {
	const blk = blocks[i];
	const prev = blk.previousHash;
	const data = blk.data;
	const difficulty = '0000';
	const batchSize = 1000 * 50;
	blk.nonce = 0;
	blk.timestamp = new Date().toLocaleString('en-US', {
		timeZone: 'Asia/Jakarta',
	});
	const t0 = performance.now();
	const status = document.getElementById(`status-${i}`);
	const ndiv = document.getElementById(`nonce-${i}`);
	const hdiv = document.getElementById(`hash-${i}`);
	const tdiv = document.getElementById(`timestamp-${i}`);
	status.textContent = 'Mining...';
	async function step() {
		const promises = [];
		for (let j = 0; j < batchSize; j++)
			promises.push(sha256(prev + data + blk.timestamp + (blk.nonce + j)));
		const results = await Promise.all(promises);
		for (let j = 0; j < results.length; j++) {
			const h = results[j];
			if (h.startsWith(difficulty)) {
				blk.nonce += j;
				blk.hash = h;
				ndiv.textContent = blk.nonce;
				hdiv.textContent = h;
				tdiv.textContent = blk.timestamp;
				const dur = ((performance.now() - t0) / 1000).toFixed(3);
				status.textContent = `✓ Mining Complete (${dur}s)`;
				return;
			}
		}
		blk.nonce += batchSize;
		ndiv.textContent = blk.nonce;
		setTimeout(step, 0);
	}
	step();
};

document.getElementById('btn-add-block').onclick = addChainBlock;
addChainBlock();

// ================== ECC DIGITAL SIGNATURE ==================
const ec = new elliptic.ec('secp256k1');
const eccPrivate = document.getElementById('ecc-private');
const eccPublic = document.getElementById('ecc-public');
const eccMessage = document.getElementById('ecc-message');
const eccSignature = document.getElementById('ecc-signature');
const eccVerifyResult = document.getElementById('ecc-verify-result');

function randomPrivateHex() {
	const arr = new Uint8Array(32);
	crypto.getRandomValues(arr);
	return Array.from(arr)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function normHex(h) {
	if (!h) return '';
	return h.toLowerCase().replace(/^0x/, '');
}

document.getElementById('btn-generate-key').onclick = () => {
	const priv = randomPrivateHex();
	const key = ec.keyFromPrivate(priv, 'hex');
	const pub =
		'04' +
		key.getPublic().getX().toString('hex').padStart(64, '0') +
		key.getPublic().getY().toString('hex').padStart(64, '0');
	eccPrivate.value = priv;
	eccPublic.value = pub;
	eccSignature.value = '';
	eccVerifyResult.textContent = '';
};

document.getElementById('btn-sign').onclick = async () => {
	const msg = eccMessage.value;
	if (!msg) {
		alert('Please enter a message!');
		return;
	}
	const priv = normHex(eccPrivate.value.trim());
	if (!priv) {
		alert('Private key is empty!');
		return;
	}
	const hash = await sha256(msg);
	const sig = ec
		.keyFromPrivate(priv, 'hex')
		.sign(hash, { canonical: true })
		.toDER('hex');
	eccSignature.value = sig;
	eccVerifyResult.textContent = '';
};

document.getElementById('btn-verify').onclick = async () => {
	try {
		const msg = eccMessage.value,
			sig = normHex(eccSignature.value.trim()),
			pub = normHex(eccPublic.value.trim());
		if (!msg || !sig || !pub) {
			alert('Please complete all fields!');
			return;
		}
		const key = ec.keyFromPublic(pub, 'hex');
		const valid = key.verify(await sha256(msg), sig);
		eccVerifyResult.textContent = valid
			? '✓ Signature is VALID!'
			: '✗ Signature is INVALID!';
		eccVerifyResult.className = valid
			? 'text-green-600 font-bold'
			: 'text-red-600 font-bold';
	} catch (e) {
		eccVerifyResult.textContent = 'Error verifying signature';
		eccVerifyResult.className = 'text-red-600 font-bold';
	}
};

// ================== KONSENSUS PAGE ==================
const ZERO = '0'.repeat(64);
let balances = { A: 100, B: 100, C: 100 };
let txPool = [];
let chainsConsensus = { A: [], B: [], C: [] };

function updateBalancesDOM() {
	['A', 'B', 'C'].forEach((u) => {
		const el = document.getElementById('saldo-' + u);
		if (el) el.textContent = balances[u];
	});
}

function parseTx(line) {
	const m = line.match(/^([A-C])\s*->\s*([A-C])\s*:\s*(\d+)$/);
	if (!m) return null;
	return { from: m[1], to: m[2], amt: parseInt(m[3]) };
}

// ======== Mining Helper ========
async function shaMine(prev, data, timestamp) {
	const diff = '000';
	const base = 1000;
	const batch = base * 50;
	return new Promise((resolve) => {
		let nonce = 0;
		async function loop() {
			const promises = [];
			for (let i = 0; i < batch; i++)
				promises.push(sha256(prev + data + timestamp + (nonce + i)));
			const results = await Promise.all(promises);
			for (let i = 0; i < results.length; i++) {
				const h = results[i];
				if (h.startsWith(diff)) {
					resolve({ nonce: nonce + i, hash: h });
					return;
				}
			}
			nonce += batch;
			setTimeout(loop, 0);
		}
		loop();
	});
}

// ======== Genesis dengan mining ========
async function createGenesisConsensus() {
	const diff = '000';
	const ts = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
	for (let u of ['A', 'B', 'C']) {
		let nonce = 0;
		let found = '';
		while (true) {
			const h = await sha256(ZERO + 'Genesis' + ts + nonce);
			if (h.startsWith(diff)) {
				found = h;
				break;
			}
			nonce++;
		}
		chainsConsensus[u] = [
			{
				index: 0,
				prev: ZERO,
				data: 'Genesis Block: 100 coins',
				timestamp: ts,
				nonce,
				hash: found,
				invalid: false,
			},
		];
	}
	renderConsensusChains();
	updateBalancesDOM();
}
createGenesisConsensus();

// ======== Render Konsensus Chain ========
function renderConsensusChains() {
	['A', 'B', 'C'].forEach((u) => {
		const cont = document.getElementById('chain-' + u);
		cont.innerHTML = '';
		chainsConsensus[u].forEach((blk, i) => {
			const d = document.createElement('div');
			d.className = blk.invalid
				? 'bg-red-100 border-2 border-red-300 rounded-lg p-3 min-w-max shadow-md'
				: 'bg-blue-50 border-2 border-blue-300 rounded-lg p-3 min-w-max shadow-md';
			d.innerHTML = `
              <div class="font-bold text-sm text-gray-800 mb-2"><i class="fas fa-cube mr-1"></i>Block #${blk.index}</div>
              <div class="space-y-2 text-xs">
                <div>
                  <label class="font-semibold text-gray-700">Prev:</label>
                  <input class="w-full px-2 py-1 border rounded bg-white text-xs font-mono break-all" value="${blk.prev}" readonly>
                </div>
                <div>
                  <label class="font-semibold text-gray-700">Data:</label>
                  <textarea class="w-full px-2 py-1 border rounded text-xs" rows="2" onchange="chainsConsensus['${u}'][${i}].data = this.value">${blk.data}</textarea>
                </div>
                <div>
                  <label class="font-semibold text-gray-700">Timestamp:</label>
                  <input class="w-full px-2 py-1 border rounded bg-white text-xs font-mono" value="${blk.timestamp}" readonly>
                </div>
                <div>
                  <label class="font-semibold text-gray-700">Nonce:</label>
                  <input class="w-full px-2 py-1 border rounded bg-white text-xs font-mono" value="${blk.nonce}" readonly>
                </div>
              </div>
            `;
			cont.appendChild(d);
		});
	});
}

// ================== NAVBAR FUNCTIONALITY ==================
// Dropdown functionality
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

dropdownBtn.addEventListener('click', (e) => {
	e.preventDefault();
	dropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
	if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
		dropdownMenu.classList.remove('show');
	}
});

// Close dropdown when a link is clicked
dropdownMenu.querySelectorAll('a').forEach((link) => {
	link.addEventListener('click', () => {
		dropdownMenu.classList.remove('show');
	});
});

// Update navigation button active states
const originalShowPage = window.showPage;
window.showPage = function (pageId) {
	originalShowPage(pageId);

	// Update active button in navbar
	document.querySelectorAll('.nav-btn').forEach((btn) => {
		btn.classList.remove('active', 'bg-gray-700');
	});

	const pageType = pageId.split('-')[1];
	const tabBtn = document.getElementById(`tab-${pageType}`);
	if (tabBtn) {
		tabBtn.classList.add('active', 'bg-gray-700');
	}
};

// ================== PAGE NAVIGATION ==================

// Define page order (excluding Home and About)
const pageOrder = [
	'page-hash',
	'page-block',
	'page-chain',
	'page-ecc',
	'page-consensus',
];

// Get current active page
function getCurrentPageIndex() {
	for (let i = 0; i < pageOrder.length; i++) {
		const page = document.getElementById(pageOrder[i]);
		if (page && page.classList.contains('active')) {
			return i;
		}
	}
	return 0;
}

// Navigate to next page (with circular navigation)
function navigateNext() {
	const currentIndex = getCurrentPageIndex();
	// If at the last page, go back to first page.  Otherwise, go to next page.
	const nextIndex = (currentIndex + 1) % pageOrder.length;
	showPage(pageOrder[nextIndex]);
	window.scrollTo(0, 0);
}

// Navigate to previous page (with circular navigation)
function navigatePrevious() {
	const currentIndex = getCurrentPageIndex();
	// If at the first page, go to last page. Otherwise, go to previous page.
	const prevIndex = (currentIndex - 1 + pageOrder.length) % pageOrder.length;
	showPage(pageOrder[prevIndex]);
	window.scrollTo(0, 0);
}

// Make navigation functions globally available
window.navigateNext = navigateNext;
window.navigatePrevious = navigatePrevious;
