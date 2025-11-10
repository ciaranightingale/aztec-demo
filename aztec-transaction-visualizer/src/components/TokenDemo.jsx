import { useState, useEffect, useRef } from 'react'
import './VotingDemo.css'

function TokenDemo() {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedUser, setSelectedUser] = useState('Alice')
  const [selectedRecipient, setSelectedRecipient] = useState('Bob')
  const [transferAmount, setTransferAmount] = useState(100)
  const logEndRef = useRef(null)

  // Private state - users' local notes (only visible to each user)
  const [privateState, setPrivateState] = useState({
    aliceNotes: [{ value: 500, nullifier: null, hash: '0xabc123...' }],
    bobNotes: [{ value: 300, nullifier: null, hash: '0xdef456...' }],
    charlieNotes: [{ value: 200, nullifier: null, hash: '0x789ghi...' }]
  })

  // Public state - on-chain trees visible to everyone
  const [publicState, setPublicState] = useState({
    noteHashTree: [
      '0xabc123...', // Alice's note hash
      '0xdef456...', // Bob's note hash
      '0x789ghi...'  // Charlie's note hash
    ],
    nullifierTree: []
  })

  const [executionLog, setExecutionLog] = useState([])
  const [codeTooltips, setCodeTooltips] = useState([])

  const addCodeTooltip = (code, description) => {
    const id = Date.now()
    setCodeTooltips(prev => {
      const newTooltips = [...prev, { id, code, description }]
      return newTooltips.slice(-5)
    })
  }

  const removeCodeTooltip = (id) => {
    setCodeTooltips(prev => prev.filter(t => t.id !== id))
  }

  const addLog = (message, type = 'info') => {
    setExecutionLog(prev => [...prev, { message, type, timestamp: Date.now() }])
  }

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logEndRef.current) {
      const container = logEndRef.current.parentElement
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [executionLog])

  const resetDemo = () => {
    setCurrentPhase(0)
    setIsProcessing(false)
    setSelectedUser('Alice')
    setSelectedRecipient('Bob')
    setTransferAmount(100)
    setExecutionLog([])
    setPrivateState({
      aliceNotes: [{ value: 500, nullifier: null, hash: '0xabc123...' }],
      bobNotes: [{ value: 300, nullifier: null, hash: '0xdef456...' }],
      charlieNotes: [{ value: 200, nullifier: null, hash: '0x789ghi...' }]
    })
    setPublicState({
      noteHashTree: ['0xabc123...', '0xdef456...', '0x789ghi...'],
      nullifierTree: []
    })
  }

  const startTransfer = () => {
    if (selectedUser === selectedRecipient) {
      alert('Cannot transfer to yourself!')
      return
    }

    setExecutionLog([])
    addLog(`💸 ${selectedUser} is transferring ${transferAmount} tokens to ${selectedRecipient}`, 'success')
    setCurrentPhase(1)
  }

  const executePrivate = () => {
    setIsProcessing(true)
    addLog('🔐 Executing in Private Execution Environment (PXE)...', 'info')

    addCodeTooltip(
      'fn transfer_private_to_private(from, to, amount, _nonce)',
      'Private function - executes on user\'s device'
    )

    setTimeout(() => {
      addLog(`📱 Running on ${selectedUser}'s device (off-chain)`, 'info')
      setTimeout(() => {
        addLog(`🔍 Reading ${selectedUser}'s private notes...`, 'info')

        addCodeTooltip(
          'storage.private_balances.at(from).try_sub(amount, max_notes)',
          'Find and nullify notes that sum to at least the transfer amount'
        )

        setTimeout(() => {
          const userKey = `${selectedUser.toLowerCase()}Notes`
          const userNotes = privateState[userKey]
          const totalBalance = userNotes.reduce((sum, note) => sum + note.value, 0)

          addLog(`✓ Found ${userNotes.length} note(s) with total value: ${totalBalance}`, 'success')

          setTimeout(() => {
            addLog(`🔑 Generating nullifiers for spent notes...`, 'info')

            setTimeout(() => {
              // Generate nullifiers for spent notes (all notes are spent in this simple demo)
              const nullifiers = userNotes.map(() => {
                const randomBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')
                return `0x${randomBytes}`
              })

              addLog(`✓ Generated ${nullifiers.length} nullifier(s)`, 'success')

              addCodeTooltip(
                'context.push_nullifier(note_nullifier)',
                'Nullifiers prevent double-spending of notes'
              )

              setTimeout(() => {
                addLog(`📝 Creating new note for ${selectedRecipient} (value: ${transferAmount})...`, 'info')

                setTimeout(() => {
                  // Generate new note hash for recipient
                  const newNoteHash = `0x${Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`
                  addLog(`✓ New note hash: ${newNoteHash}`, 'success')

                  addCodeTooltip(
                    'private_balances.at(to).add(to, amount).emit(...)',
                    'Create and emit new note to recipient'
                  )

                  setTimeout(() => {
                    const change = totalBalance - transferAmount
                    if (change > 0) {
                      addLog(`💰 Creating change note for ${selectedUser} (value: ${change})...`, 'info')
                      setTimeout(() => {
                        const changeNoteHash = `0x${Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')}...`
                        addLog(`✓ Change note hash: ${changeNoteHash}`, 'success')

                        // Update private state
                        const recipientKey = `${selectedRecipient.toLowerCase()}Notes`
                        setPrivateState(prev => ({
                          ...prev,
                          [userKey]: [{ value: change, nullifier: null, hash: changeNoteHash }],
                          [recipientKey]: [...prev[recipientKey], { value: transferAmount, nullifier: null, hash: newNoteHash }]
                        }))

                        // Store nullifiers and hashes for later
                        window.tempTransferData = { nullifiers, newNoteHash, changeNoteHash }

                        setTimeout(() => {
                          addLog('✓ Private execution complete!', 'success')
                          setIsProcessing(false)
                          setCurrentPhase(2)
                        }, 500)
                      }, 500)
                    } else {
                      // No change needed
                      const recipientKey = `${selectedRecipient.toLowerCase()}Notes`
                      setPrivateState(prev => ({
                        ...prev,
                        [userKey]: [],
                        [recipientKey]: [...prev[recipientKey], { value: transferAmount, nullifier: null, hash: newNoteHash }]
                      }))

                      window.tempTransferData = { nullifiers, newNoteHash, changeNoteHash: null }

                      addLog('✓ Private execution complete!', 'success')
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
    }, 500)
  }

  const submitToSequencer = () => {
    setIsProcessing(true)
    addLog('📡 Submitting transaction to sequencer...', 'info')

    setTimeout(() => {
      addLog('🔍 Sequencer validating zero-knowledge proof...', 'info')
      setTimeout(() => {
        addLog('✓ Proof is valid!', 'success')
        setTimeout(() => {
          addLog('🔍 Checking nullifier tree for double-spending...', 'info')
          setTimeout(() => {
            const { nullifiers } = window.tempTransferData
            addLog(`✓ Nullifiers are unique (no double-spending detected)`, 'success')
            setTimeout(() => {
              addLog('🌳 Adding nullifiers to Nullifier Tree...', 'info')
              setTimeout(() => {
                setPublicState(prev => ({
                  ...prev,
                  nullifierTree: [...prev.nullifierTree, ...nullifiers]
                }))
                addLog('✓ Nullifiers added (notes are now spent)', 'success')
                setTimeout(() => {
                  addLog('🌳 Adding new note hashes to Note Hash Tree...', 'info')
                  setTimeout(() => {
                    const { newNoteHash, changeNoteHash } = window.tempTransferData
                    const newHashes = changeNoteHash ? [newNoteHash, changeNoteHash] : [newNoteHash]
                    setPublicState(prev => ({
                      ...prev,
                      noteHashTree: [...prev.noteHashTree, ...newHashes]
                    }))
                    addLog('✓ Note hashes added (new notes are now spendable)', 'success')
                    setIsProcessing(false)
                    setCurrentPhase(3)
                  }, 600)
                }, 500)
              }, 600)
            }, 500)
          }, 500)
        }, 600)
      }, 500)
    }, 500)
  }

  const users = ['Alice', 'Bob', 'Charlie']

  return (
    <div className="voting-demo">
      <div className="demo-header">
        <h2>Private Token Transfer Demo</h2>
        <p>Understand how Aztec uses note hash trees and nullifier trees for private token transfers</p>
      </div>

      {/* Step Progress Bar */}
      <div className="step-progress-horizontal">
        <div className={`step-item ${currentPhase >= 1 ? 'completed' : ''} ${currentPhase === 1 ? 'active' : ''}`}>
          <div className="step-circle">1</div>
          <span className="step-text">Private Execution</span>
          <span className="step-badge private">private</span>
        </div>

        <div className="step-connector"></div>

        <div className={`step-item ${currentPhase >= 2 ? 'completed' : ''} ${currentPhase === 2 ? 'active' : ''}`}>
          <div className="step-circle">2</div>
          <span className="step-text">Submit Proof</span>
          <span className="step-badge private">private</span>
        </div>

        <div className="step-connector"></div>

        <div className={`step-item ${currentPhase >= 3 ? 'completed' : ''} ${currentPhase === 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span className="step-text">Update Trees</span>
          <span className="step-badge public">public</span>
        </div>
      </div>

      {/* Code Tooltips */}
      <div className="code-tooltips-container">
        {codeTooltips.map(tooltip => (
          <div key={tooltip.id} className="code-tooltip">
            <button className="tooltip-close" onClick={() => removeCodeTooltip(tooltip.id)}>×</button>
            <div className="tooltip-code">{tooltip.code}</div>
            <div className="tooltip-description">{tooltip.description}</div>
          </div>
        ))}
      </div>

      {/* Action Button Area */}
      <div className="action-button-area">
        {currentPhase === 0 ? (
          <div className="action-panel-center">
            <h4>Transfer Tokens</h4>
            <p>Select a sender, recipient, and amount to see how private transfers work on Aztec</p>

            <div className="form-row-center">
              <div className="form-field">
                <label>From:</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  {users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>To:</label>
                <select value={selectedRecipient} onChange={(e) => setSelectedRecipient(e.target.value)}>
                  {users.filter(u => u !== selectedUser).map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Amount:</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <button className="primary-btn" onClick={startTransfer}>
              Transfer Tokens
            </button>
          </div>
        ) : currentPhase === 1 ? (
          <div className="action-panel-center">
            <div className="vote-status-inline">
              <span className="status-icon">💸</span>
              <strong>{selectedUser}</strong> sending <strong className="vote-highlight">{transferAmount} tokens</strong> to <strong>{selectedRecipient}</strong>
            </div>
            <h4>Phase 1: Private Execution</h4>
            <p>Transfer is processed privately on {selectedUser}'s device. Nullifiers prevent double-spending.</p>
            <button
              className="primary-btn"
              onClick={() => {
                setCodeTooltips([])
                executePrivate()
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Executing...' : 'Execute Private Transfer'}
            </button>
          </div>
        ) : currentPhase === 2 ? (
          <div className="action-panel-center">
            <div className="vote-status-inline">
              <span className="status-icon">💸</span>
              <strong>{selectedUser}</strong> sending <strong className="vote-highlight">{transferAmount} tokens</strong> to <strong>{selectedRecipient}</strong>
            </div>
            <h4>Phase 2: Submit to Sequencer</h4>
            <p>Zero-knowledge proof submitted to sequencer. Trees will be updated.</p>
            <button
              className="primary-btn"
              onClick={() => {
                setCodeTooltips([])
                submitToSequencer()
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Submitting...' : 'Submit Proof'}
            </button>
          </div>
        ) : (
          <div className="action-panel-center success">
            <div className="vote-status-inline">
              <span className="status-icon">💸</span>
              <strong>{selectedUser}</strong> sent <strong className="vote-highlight">{transferAmount} tokens</strong> to <strong>{selectedRecipient}</strong>
            </div>
            <h4>✅ Transfer Complete!</h4>
            <p>The transfer has been successfully recorded while maintaining privacy</p>
            <button className="secondary-btn" onClick={resetDemo}>
              Make Another Transfer
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="demo-container">
        <div className="left-panel">
          <div className="execution-log">
            <h4>Execution Log</h4>
            <div className="log-entries">
              {executionLog.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`}>
                  {log.message}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="state-section">
            <h3>💰 Private Balances <span className="location-badge private">local</span></h3>
            <p className="state-description">Only visible to each user on their device</p>
            {users.map(user => {
              const userKey = `${user.toLowerCase()}Notes`
              const notes = privateState[userKey]
              const totalBalance = notes.reduce((sum, note) => sum + note.value, 0)

              return (
                <div key={user} className="tally-item">
                  <span className="candidate-name">{user}:</span>
                  <span className="vote-count">{totalBalance} tokens ({notes.length} note{notes.length !== 1 ? 's' : ''})</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* State Trees */}
      <div className="trees-section">
        <div className="state-card">
          <h4>🌳 Note Hash Tree (Public)</h4>
          <p className="tree-description">Contains commitments to all notes - stored on-chain but values are encrypted</p>
          {publicState.noteHashTree.length === 0 ? (
            <div className="empty-state">No note hashes yet</div>
          ) : (
            <div className="nullifier-list">
              {publicState.noteHashTree.map((hash, i) => (
                <div key={i} className="nullifier-item">
                  <div className="nullifier-index">Note #{i + 1}</div>
                  <code className="nullifier-value">{hash}</code>
                  <div className="privacy-note">🔒 Hash visible but note value and owner are encrypted</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="state-card">
          <h4>🚫 Nullifier Tree (Public)</h4>
          <p className="tree-description">Contains nullifiers of spent notes - prevents double-spending</p>
          {publicState.nullifierTree.length === 0 ? (
            <div className="empty-state">No nullifiers yet</div>
          ) : (
            <div className="nullifier-list">
              {publicState.nullifierTree.map((nullifier, i) => (
                <div key={i} className="nullifier-item">
                  <div className="nullifier-index">Nullifier #{i + 1}</div>
                  <code className="nullifier-value">{nullifier}</code>
                  <div className="privacy-note">🔒 Prevents note from being spent again</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="key-concepts">
        <h3>How Private Token Transfers Work</h3>
        <div className="concepts-grid">
          <div className="concept-card">
            <h4>📝 Notes (UTXO Model)</h4>
            <p>Each user has notes (like UTXOs) with values. To transfer, you spend existing notes and create new ones. The note hash tree stores commitments to all notes.</p>
          </div>
          <div className="concept-card">
            <h4>🚫 Nullifiers</h4>
            <p>When spending a note, you generate a unique nullifier. The nullifier tree prevents the same note from being spent twice (double-spending protection).</p>
          </div>
          <div className="concept-card">
            <h4>🌳 Note Hash Tree</h4>
            <p>Stores commitments (hashes) of all notes. The hash reveals nothing about the note's value or owner - that info is encrypted and only the owner can decrypt it.</p>
          </div>
          <div className="concept-card">
            <h4>🔐 Privacy Guarantees</h4>
            <p>Transfer amounts, sender, and recipient are hidden. Only zero-knowledge proofs are submitted on-chain, proving the transfer is valid without revealing details.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenDemo
