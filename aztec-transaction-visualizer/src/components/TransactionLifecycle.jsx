import { useState, useEffect } from 'react'
import './TransactionLifecycle.css'

function TransactionLifecycle() {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [privateState, setPrivateState] = useState({
    aliceNotes: [{ id: 1, value: 100, hash: '0xa1b2' }],
    bobNotes: []
  })
  const [publicState, setPublicState] = useState({
    noteHashTree: ['0xa1b2'],
    nullifierTree: [],
    publicData: {}
  })
  const [proof, setProof] = useState(null)
  const [executionLog, setExecutionLog] = useState([])

  const [formData, setFormData] = useState({
    from: 'Alice',
    to: 'Bob',
    amount: 50
  })

  const addLog = (message, type = 'info') => {
    setExecutionLog(prev => [...prev, { message, type, timestamp: Date.now() }])
  }

  const resetTransaction = () => {
    setCurrentPhase(0)
    setIsProcessing(false)
    setTransaction(null)
    setProof(null)
    setExecutionLog([])
    setPrivateState({
      aliceNotes: [{ id: 1, value: 100, hash: '0xa1b2' }],
      bobNotes: []
    })
    setPublicState({
      noteHashTree: ['0xa1b2'],
      nullifierTree: [],
      publicData: {}
    })
  }

  const startTransaction = () => {
    setTransaction({
      from: formData.from,
      to: formData.to,
      amount: formData.amount,
      timestamp: Date.now()
    })
    setExecutionLog([])
    addLog(`🚀 Starting transaction: ${formData.from} → ${formData.to} (${formData.amount} tokens)`, 'success')
    setCurrentPhase(1)
  }

  const executePrivate = () => {
    setIsProcessing(true)
    addLog('📱 Executing in Private Execution Environment (PXE)...', 'info')

    setTimeout(() => {
      addLog('🔍 Reading Alice\'s notes from private storage', 'info')
      setTimeout(() => {
        addLog(`✓ Found note with value: 100 tokens`, 'success')
        setTimeout(() => {
          addLog('🔐 Generating nullifier for spent note', 'info')
          setTimeout(() => {
            const nullifier = `0xnull_${Math.random().toString(36).substr(2, 4)}`
            addLog(`✓ Nullifier created: ${nullifier}`, 'success')
            setTimeout(() => {
              addLog('📝 Creating new note for Bob', 'info')
              setTimeout(() => {
                const bobNoteHash = `0xnote_${Math.random().toString(36).substr(2, 4)}`
                addLog(`✓ Bob's note hash: ${bobNoteHash}`, 'success')
                setTimeout(() => {
                  const changeAmount = 100 - formData.amount
                  if (changeAmount > 0) {
                    addLog(`📝 Creating change note for Alice (${changeAmount} tokens)`, 'info')
                    setTimeout(() => {
                      const aliceChangeHash = `0xnote_${Math.random().toString(36).substr(2, 4)}`
                      addLog(`✓ Alice's change note hash: ${aliceChangeHash}`, 'success')
                      setTimeout(() => {
                        addLog('✓ Private execution complete!', 'success')
                        setPrivateState(prev => ({
                          aliceNotes: [
                            { id: 1, value: 100, spent: true, nullifier, hash: prev.aliceNotes[0].hash },
                            { id: 3, value: changeAmount, hash: aliceChangeHash, isNew: true }
                          ],
                          bobNotes: [{ id: 2, value: formData.amount, hash: bobNoteHash, isNew: true }]
                        }))
                        setIsProcessing(false)
                        setCurrentPhase(2)
                      }, 500)
                    }, 500)
                  } else {
                    addLog('✓ Private execution complete!', 'success')
                    setPrivateState(prev => ({
                      aliceNotes: [{ id: 1, value: 100, spent: true, nullifier, hash: prev.aliceNotes[0].hash }],
                      bobNotes: [{ id: 2, value: formData.amount, hash: bobNoteHash, isNew: true }]
                    }))
                    setIsProcessing(false)
                    setCurrentPhase(2)
                  }
                }, 500)
              }, 500)
            }, 500)
          }, 500)
        }, 500)
      }, 500)
    }, 500)
  }

  const generateProof = () => {
    setIsProcessing(true)
    addLog('🔬 Generating zero-knowledge proof...', 'info')

    setTimeout(() => {
      addLog('⚙️ Running private kernel circuit', 'info')
      setTimeout(() => {
        addLog('🔐 Proving correct execution without revealing inputs', 'info')
        setTimeout(() => {
          const proofData = {
            commitments: [`0xcommit_${Math.random().toString(36).substr(2, 4)}`],
            nullifiers: [privateState.aliceNotes[0].nullifier],
            publicInputs: []
          }
          setProof(proofData)
          addLog('✓ Zero-knowledge proof generated!', 'success')
          addLog(`📦 Proof size: ~2KB (actual transaction data hidden)`, 'info')
          setIsProcessing(false)
          setCurrentPhase(3)
        }, 800)
      }, 600)
    }, 600)
  }

  const submitToSequencer = () => {
    setIsProcessing(true)
    addLog('📡 Submitting to sequencer...', 'info')

    setTimeout(() => {
      addLog('✓ Proof received by sequencer', 'success')
      setTimeout(() => {
        addLog('🔍 Validating zero-knowledge proof', 'info')
        setTimeout(() => {
          addLog('✓ Proof is valid!', 'success')
          setTimeout(() => {
            addLog('📝 Checking nullifier doesn\'t exist...', 'info')
            setTimeout(() => {
              addLog('✓ Nullifier is unique (no double-spend)', 'success')
              setTimeout(() => {
                addLog('🌳 Updating state trees...', 'info')
                setTimeout(() => {
                  const newNoteHashes = [privateState.bobNotes[0].hash]
                  const aliceChangeNote = privateState.aliceNotes.find(n => !n.spent)
                  if (aliceChangeNote && aliceChangeNote.hash) {
                    newNoteHashes.push(aliceChangeNote.hash)
                  }

                  setPublicState(prev => ({
                    noteHashTree: [...prev.noteHashTree, ...newNoteHashes],
                    nullifierTree: [...prev.nullifierTree, privateState.aliceNotes[0].nullifier],
                    publicData: prev.publicData
                  }))
                  addLog(`✓ Note hash tree updated (${newNoteHashes.length} new note${newNoteHashes.length > 1 ? 's' : ''})`, 'success')
                  addLog('✓ Nullifier tree updated', 'success')
                  setIsProcessing(false)
                  setCurrentPhase(4)
                }, 600)
              }, 500)
            }, 500)
          }, 500)
        }, 600)
      }, 500)
    }, 500)
  }

  const submitToL1 = () => {
    setIsProcessing(true)
    addLog('🔗 Creating rollup proof batch...', 'info')

    setTimeout(() => {
      addLog('📦 Aggregating multiple transactions into rollup', 'info')
      setTimeout(() => {
        addLog('🚀 Submitting to Ethereum L1...', 'info')
        setTimeout(() => {
          addLog('⛓️ Ethereum verifier contract validating proof', 'info')
          setTimeout(() => {
            addLog('✓ Proof verified on L1!', 'success')
            setTimeout(() => {
              addLog('📝 Recording new state root on-chain', 'info')
              setTimeout(() => {
                addLog('🎉 Transaction finalized and immutable!', 'success')
                setIsProcessing(false)
                setCurrentPhase(5)
              }, 600)
            }, 500)
          }, 800)
        }, 600)
      }, 500)
    }, 500)
  }

  return (
    <div className="transaction-lifecycle">
      <div className="lifecycle-header">
        <h2>Aztec Transaction Simulator</h2>
        <p>Create a transaction and watch it flow through Aztec's privacy-preserving architecture</p>
      </div>

      <div className="simulator-container">
        <div className="left-panel">
          {currentPhase === 0 && (
            <div className="transaction-form">
              <h3>Create Transaction</h3>
              <div className="form-group">
                <label>From:</label>
                <select value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})}>
                  <option value="Alice">Alice</option>
                </select>
              </div>
              <div className="form-group">
                <label>To:</label>
                <select value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})}>
                  <option value="Bob">Bob</option>
                  <option value="Charlie">Charlie</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                />
              </div>
              <button className="primary-btn" onClick={startTransaction}>
                Send Transaction
              </button>
            </div>
          )}

          {currentPhase > 0 && (
            <div className="transaction-info">
              <h3>Transaction Details</h3>
              <div className="info-row">
                <span>From:</span>
                <strong>{transaction.from}</strong>
              </div>
              <div className="info-row">
                <span>To:</span>
                <strong>{transaction.to}</strong>
              </div>
              <div className="info-row">
                <span>Amount:</span>
                <strong>{transaction.amount} tokens</strong>
              </div>
            </div>
          )}

          <div className="phase-progress">
            <div className={`phase-step ${currentPhase >= 1 ? 'active' : ''} ${currentPhase === 1 ? 'current' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-info">
                <strong>Private Execution</strong>
                <span className="location-badge off-chain">off-chain</span>
              </div>
            </div>

            <div className={`phase-step ${currentPhase >= 2 ? 'active' : ''} ${currentPhase === 2 ? 'current' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-info">
                <strong>Proof Generation</strong>
                <span className="location-badge off-chain">off-chain</span>
              </div>
            </div>

            <div className={`phase-step ${currentPhase >= 3 ? 'active' : ''} ${currentPhase === 3 ? 'current' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-info">
                <strong>Sequencer Processing</strong>
                <span className="location-badge on-chain">on-chain</span>
              </div>
            </div>

            <div className={`phase-step ${currentPhase >= 4 ? 'active' : ''} ${currentPhase === 4 ? 'current' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-info">
                <strong>Rollup Generation</strong>
                <span className="location-badge on-chain">on-chain</span>
              </div>
            </div>

            <div className={`phase-step ${currentPhase >= 5 ? 'active' : ''} ${currentPhase === 5 ? 'current' : ''}`}>
              <div className="step-number">5</div>
              <div className="step-info">
                <strong>L1 Settlement</strong>
                <span className="location-badge on-chain">on-chain</span>
              </div>
            </div>
          </div>

          {currentPhase === 1 && (
            <div className="action-panel">
              <h4>Phase 1: Private Execution</h4>
              <p>Execute the transaction locally in the PXE (Private Execution Environment)</p>
              <button
                className="primary-btn"
                onClick={executePrivate}
                disabled={isProcessing}
              >
                {isProcessing ? 'Executing...' : 'Execute Privately'}
              </button>
            </div>
          )}

          {currentPhase === 2 && (
            <div className="action-panel">
              <h4>Phase 2: Generate Proof</h4>
              <p>Create zero-knowledge proof of correct execution</p>
              <button
                className="primary-btn"
                onClick={generateProof}
                disabled={isProcessing}
              >
                {isProcessing ? 'Generating...' : 'Generate ZK Proof'}
              </button>
            </div>
          )}

          {currentPhase === 3 && (
            <div className="action-panel">
              <h4>Phase 3: Submit to Sequencer</h4>
              <p>Sequencer validates proof and updates state trees</p>
              <button
                className="primary-btn"
                onClick={submitToSequencer}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Submit to Sequencer'}
              </button>
            </div>
          )}

          {currentPhase === 4 && (
            <div className="action-panel">
              <h4>Phase 4: Submit to L1</h4>
              <p>Final proof submitted to Ethereum for settlement</p>
              <button
                className="primary-btn"
                onClick={submitToL1}
                disabled={isProcessing}
              >
                {isProcessing ? 'Submitting...' : 'Submit to Ethereum'}
              </button>
            </div>
          )}

          {currentPhase === 5 && (
            <div className="action-panel success">
              <h4>✅ Transaction Complete!</h4>
              <p>The transaction has been finalized on Ethereum L1</p>
              <button className="secondary-btn" onClick={resetTransaction}>
                Create New Transaction
              </button>
            </div>
          )}

          <div className="execution-log">
            <h4>Execution Log</h4>
            <div className="log-entries">
              {executionLog.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`}>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="state-section">
            <h3>Private State <span className="location-badge off-chain">off-chain</span></h3>
            <p className="state-description">Only visible to note owners</p>

            <div className="state-container">
              <div className="user-state">
                <h4>Alice's Notes</h4>
                {privateState.aliceNotes.map(note => (
                  <div key={note.id} className={`note-card ${note.spent ? 'spent' : note.isNew ? 'new' : ''}`}>
                    <div className="note-value">{note.value} tokens</div>
                    <div className="note-hash">Hash: {note.hash}</div>
                    {note.spent && (
                      <div className="note-status">
                        <span className="status-badge">SPENT</span>
                        <div className="nullifier">Nullifier: {note.nullifier}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="user-state">
                <h4>Bob's Notes</h4>
                {privateState.bobNotes.length === 0 ? (
                  <div className="empty-state">No notes yet</div>
                ) : (
                  privateState.bobNotes.map(note => (
                    <div key={note.id} className={`note-card ${note.isNew ? 'new' : ''}`}>
                      <div className="note-value">{note.value} tokens</div>
                      <div className="note-hash">Hash: {note.hash}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="state-section">
            <h3>Public State <span className="location-badge on-chain">on-chain</span></h3>
            <p className="state-description">Visible to everyone, but privacy-preserving</p>

            <div className="tree-display">
              <h4>📦 Note Hash Tree (Append-Only)</h4>
              <div className="tree-items">
                {publicState.noteHashTree.map((hash, i) => (
                  <div key={i} className={`tree-item ${i >= 1 ? 'new' : ''}`}>
                    {hash}
                  </div>
                ))}
              </div>
              <div className="tree-note">Stores note commitments</div>
            </div>

            <div className="tree-display">
              <h4>🚫 Nullifier Tree</h4>
              <div className="tree-items">
                {publicState.nullifierTree.length === 0 ? (
                  <div className="empty-state">No nullifiers yet</div>
                ) : (
                  publicState.nullifierTree.map((nullifier, i) => (
                    <div key={i} className="tree-item new">
                      {nullifier}
                    </div>
                  ))
                )}
              </div>
              <div className="tree-note">Prevents double-spending</div>
            </div>
          </div>

          {proof && (
            <div className="state-section proof-section">
              <h3>🔐 Zero-Knowledge Proof</h3>
              <div className="proof-display">
                <div className="proof-item">
                  <strong>Commitments:</strong>
                  {proof.commitments.map((c, i) => (
                    <div key={i} className="proof-value">{c}</div>
                  ))}
                </div>
                <div className="proof-item">
                  <strong>Nullifiers:</strong>
                  {proof.nullifiers.map((n, i) => (
                    <div key={i} className="proof-value">{n}</div>
                  ))}
                </div>
                <div className="proof-note">
                  ✓ Proves correctness without revealing transaction details
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionLifecycle
