import { useState } from 'react'
import './VotingDemo.css'

function VotingDemo() {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedVoter, setSelectedVoter] = useState('Alice')

  // Public state (visible to everyone on-chain)
  const [publicState, setPublicState] = useState({
    admin: 'Admin',
    voteEnded: false,
    activeAtBlock: 100,
    tally: {
      'Candidate A': 0,
      'Candidate B': 0,
      'Candidate C': 0
    },
    nullifierTree: []
  })

  // Private state (only visible to individual users)
  const [privateState, setPrivateState] = useState({
    aliceHasVoted: false,
    bobHasVoted: false,
    charlieHasVoted: false,
    aliceNullifier: null,
    bobNullifier: null,
    charlieNullifier: null,
    aliceVotedFor: null,
    bobVotedFor: null,
    charlieVotedFor: null
  })

  const [executionLog, setExecutionLog] = useState([])
  const [codeTooltips, setCodeTooltips] = useState([])

  const addCodeTooltip = (code, description) => {
    const id = Date.now()
    setCodeTooltips(prev => {
      const newTooltips = [...prev, { id, code, description }]
      // Keep only the last 5 tooltips
      return newTooltips.slice(-5)
    })
  }

  const removeCodeTooltip = (id) => {
    setCodeTooltips(prev => prev.filter(t => t.id !== id))
  }

  const addLog = (message, type = 'info') => {
    setExecutionLog(prev => [...prev, { message, type, timestamp: Date.now() }])
  }

  const resetDemo = () => {
    setCurrentPhase(0)
    setIsProcessing(false)
    setSelectedCandidate(null)
    setSelectedVoter('Alice')
    setExecutionLog([])
    setPublicState({
      admin: 'Admin',
      voteEnded: false,
      activeAtBlock: 100,
      tally: {
        'Candidate A': 0,
        'Candidate B': 0,
        'Candidate C': 0
      },
      nullifierTree: []
    })
    setPrivateState({
      aliceHasVoted: false,
      bobHasVoted: false,
      charlieHasVoted: false,
      aliceNullifier: null,
      bobNullifier: null,
      charlieNullifier: null,
      aliceVotedFor: null,
      bobVotedFor: null,
      charlieVotedFor: null
    })
  }

  const startVote = () => {
    if (!selectedCandidate) {
      alert('Please select a candidate')
      return
    }

    // Check if voter already voted
    const hasVoted = privateState[`${selectedVoter.toLowerCase()}HasVoted`]
    if (hasVoted) {
      alert(`${selectedVoter} has already voted!`)
      return
    }

    setExecutionLog([])
    addLog(`🗳️ ${selectedVoter} is casting a vote for ${selectedCandidate}`, 'success')
    setCurrentPhase(1)
  }

  const executePrivate = () => {
    setIsProcessing(true)
    addLog('🔐 Executing in Private Execution Environment (PXE)...', 'info')

    addCodeTooltip(
      'fn cast_vote(candidate: Field)',
      'Private function - executes on user\'s device'
    )

    setTimeout(() => {
      addLog(`📱 Running on ${selectedVoter}'s device (off-chain)`, 'info')
      setTimeout(() => {
        addLog(`🔍 Checking if ${selectedVoter} has already voted...`, 'info')
        setTimeout(() => {
          addLog(`✓ No previous vote found for ${selectedVoter}`, 'success')
          setTimeout(() => {
            addLog(`🔑 Retrieving ${selectedVoter}'s nullifier secret key...`, 'info')

            addCodeTooltip(
              'let secret = context.request_nsk_app(...)',
              'Get the nullifier secret key for this user'
            )

            setTimeout(() => {
              // Generate truly random-looking nullifier (not linked to voter name)
              const randomBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')
              const nullifier = `0x${randomBytes}`
              addLog(`✓ Generated nullifier: ${nullifier.substring(0, 10)}...`, 'success')

              addCodeTooltip(
                'let nullifier = poseidon2_hash([msg_sender, secret])',
                'Create unique nullifier to prevent double-voting'
              )

              setTimeout(() => {
                addLog('📝 Creating public function call: add_to_tally_public()', 'info')

                addCodeTooltip(
                  'context.push_nullifier(nullifier)',
                  'Add nullifier to prevent this voter from voting again'
                )

                setTimeout(() => {
                  addLog(`✓ Private execution complete! Vote for "${selectedCandidate}" prepared`, 'success')

                  addCodeTooltip(
                    'PrivateVoting::at(...).add_to_tally_public(candidate).enqueue()',
                    'Queue public function to update the tally'
                  )

                  const voterKey = `${selectedVoter.toLowerCase()}Nullifier`
                  const voteChoiceKey = `${selectedVoter.toLowerCase()}VotedFor`
                  setPrivateState(prev => ({
                    ...prev,
                    [voterKey]: nullifier,
                    [voteChoiceKey]: selectedCandidate,
                    [`${selectedVoter.toLowerCase()}HasVoted`]: true
                  }))

                  setIsProcessing(false)
                  setCurrentPhase(2)
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
          addLog('🔍 Checking nullifier tree for double-voting...', 'info')
          setTimeout(() => {
            const nullifier = privateState[`${selectedVoter.toLowerCase()}Nullifier`]
            addLog(`✓ Nullifier ${nullifier} is unique`, 'success')
            setTimeout(() => {
              addLog('🌳 Adding nullifier to Nullifier Tree...', 'info')
              setTimeout(() => {
                setPublicState(prev => ({
                  ...prev,
                  nullifierTree: [...prev.nullifierTree, {
                    value: nullifier,
                    voter: selectedVoter
                  }]
                }))
                addLog('✓ Nullifier added (prevents double-voting)', 'success')
                setIsProcessing(false)
                setCurrentPhase(3)
              }, 600)
            }, 500)
          }, 500)
        }, 600)
      }, 500)
    }, 500)
  }

  const executePublicFunction = () => {
    setIsProcessing(true)
    addLog('⚙️ Executing public function: add_to_tally_public()...', 'info')

    addCodeTooltip(
      'fn add_to_tally_public(candidate: Field)',
      'Public function - updates on-chain state'
    )

    setTimeout(() => {
      addLog('🔍 Reading public state: vote_ended...', 'info')

      addCodeTooltip(
        'assert(storage.vote_ended.read() == false, "Vote has ended")',
        'Check that voting is still active'
      )

      setTimeout(() => {
        addLog(`✓ Vote is still active (vote_ended = ${publicState.voteEnded})`, 'success')
        setTimeout(() => {
          addLog(`📊 Reading current tally for ${selectedCandidate}...`, 'info')

          addCodeTooltip(
            'let new_tally = storage.tally.at(candidate).read() + 1',
            'Read current vote count and increment by 1'
          )

          setTimeout(() => {
            const currentTally = publicState.tally[selectedCandidate]
            addLog(`✓ Current tally: ${currentTally}`, 'info')
            setTimeout(() => {
              addLog(`➕ Incrementing tally for ${selectedCandidate}...`, 'info')

              addCodeTooltip(
                'storage.tally.at(candidate).write(new_tally)',
                'Write updated tally to public storage'
              )

              setTimeout(() => {
                setPublicState(prev => ({
                  ...prev,
                  tally: {
                    ...prev.tally,
                    [selectedCandidate]: prev.tally[selectedCandidate] + 1
                  }
                }))
                addLog(`✓ New tally: ${currentTally + 1}`, 'success')
                setTimeout(() => {
                  addLog('🎉 Vote successfully counted!', 'success')
                  setIsProcessing(false)
                  setCurrentPhase(4)
                }, 500)
              }, 600)
            }, 500)
          }, 500)
        }, 500)
      }, 500)
    }, 500)
  }

  const candidates = ['Candidate A', 'Candidate B', 'Candidate C']
  const voters = ['Alice', 'Bob', 'Charlie']

  return (
    <div className="voting-demo">
      <div className="demo-header">
        <h2>Private Voting Contract Demo</h2>
        <p>Understand how Aztec combines private and public execution for privacy-preserving voting</p>
      </div>

      {/* Step Progress Bar - AT THE TOP */}
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
          <span className="step-text">Update Public State</span>
          <span className="step-badge public">public</span>
        </div>

        <div className="step-connector"></div>

        <div className={`step-item ${currentPhase >= 4 ? 'completed' : ''} ${currentPhase === 4 ? 'active' : ''}`}>
          <div className="step-circle">4</div>
          <span className="step-text">Complete</span>
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

      {/* Action Button Area - Always at top center */}
      <div className="action-button-area">
        {currentPhase === 0 ? (
          <div className="action-panel-center">
            <h4>Cast Your Vote</h4>
            <p>Select a voter and candidate to see how private voting works on Aztec</p>

            <div className="form-row-center">
              <div className="form-field">
                <label>Voter:</label>
                <select value={selectedVoter} onChange={(e) => setSelectedVoter(e.target.value)}>
                  {voters.map(voter => (
                    <option key={voter} value={voter}>{voter}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Candidate:</label>
                <select value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value)}>
                  <option value="">Choose...</option>
                  {candidates.map(candidate => (
                    <option key={candidate} value={candidate}>{candidate}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="primary-btn" onClick={startVote} disabled={!selectedCandidate}>
              {!selectedCandidate ? 'Select a Candidate' : 'Cast Vote'}
            </button>
          </div>
        ) : currentPhase === 1 ? (
          <div className="action-panel-center">
            <div className="vote-status-inline">
              <span className="status-icon">🗳️</span>
              <strong>{selectedVoter}</strong> voting for <strong className="vote-highlight">{selectedCandidate}</strong>
            </div>
            <h4>Phase 1: Private Execution</h4>
            <p>Vote is processed privately on {selectedVoter}'s device. No one can see who voted for whom.</p>
            <button
              className="primary-btn"
              onClick={executePrivate}
              disabled={isProcessing}
            >
              {isProcessing ? 'Executing...' : 'Execute Private Vote'}
            </button>
          </div>
        ) : currentPhase === 2 ? (
          <div className="action-panel-center">
            <div className="vote-status-inline">
              <span className="status-icon">🗳️</span>
              <strong>{selectedVoter}</strong> voting for <strong className="vote-highlight">{selectedCandidate}</strong>
            </div>
            <h4>Phase 2: Submit to Sequencer</h4>
            <p>Zero-knowledge proof submitted to sequencer. Nullifier prevents double-voting.</p>
            <button
              className="primary-btn"
              onClick={submitToSequencer}
              disabled={isProcessing}
            >
              {isProcessing ? 'Submitting...' : 'Submit Proof'}
            </button>
          </div>
        ) : currentPhase === 3 ? (
          <div className="action-panel-center">
            <div className="vote-status-inline">
              <span className="status-icon">🗳️</span>
              <strong>{selectedVoter}</strong> voting for <strong className="vote-highlight">{selectedCandidate}</strong>
            </div>
            <h4>Phase 3: Execute Public Function</h4>
            <p>Public function updates the tally. Everyone can see the count, but not individual votes.</p>
            <button
              className="primary-btn"
              onClick={executePublicFunction}
              disabled={isProcessing}
            >
              {isProcessing ? 'Updating...' : 'Update Public Tally'}
            </button>
          </div>
        ) : (
          <div className="action-panel-center success">
            <div className="vote-status-inline">
              <span className="status-icon">🗳️</span>
              <strong>{selectedVoter}</strong> voted for <strong className="vote-highlight">{selectedCandidate}</strong>
            </div>
            <h4>✅ Vote Counted!</h4>
            <p>Your vote has been successfully recorded while maintaining your privacy</p>
            <button className="secondary-btn" onClick={resetDemo}>
              Cast Another Vote
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout - Always visible */}
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
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="state-section">
            <h3>📊 Vote Tally <span className="location-badge public">public</span></h3>
            <p className="state-description">Everyone can see the totals</p>
            {Object.entries(publicState.tally).map(([candidate, count]) => (
              <div key={candidate} className="tally-item">
                <span className="candidate-name">{candidate}:</span>
                <span className="vote-count">{count} votes</span>
                <div className="vote-bar">
                  <div
                    className="vote-fill"
                    style={{width: `${(count / Math.max(1, Object.values(publicState.tally).reduce((a,b) => a+b, 0))) * 100}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* State Trees */}
      <div className="trees-section">
        <div className="state-card">
          <h4>🔐 Private Execution Context</h4>
          <p className="tree-description">Vote execution happens locally on each voter's device</p>
          <div className="private-state-grid">
            {voters.map(voter => {
              const hasVoted = privateState[`${voter.toLowerCase()}HasVoted`]
              const votedFor = privateState[`${voter.toLowerCase()}VotedFor`]

              return (
                <div key={voter} className={`voter-card ${hasVoted ? 'voted' : ''}`}>
                  <h4>{voter}'s Device</h4>
                  {hasVoted ? (
                    <>
                      <div className="vote-choice">✓ Voted for: {votedFor}</div>
                      <div className="privacy-note">🔒 Only {voter} knows this - not stored on-chain</div>
                    </>
                  ) : (
                    <div className="no-vote">No private execution yet</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="state-card">
          <h4>🚫 Nullifier Tree (Public)</h4>
          <p className="tree-description">Unique nullifiers prevent double-voting - stored on-chain</p>
          {publicState.nullifierTree.length === 0 ? (
            <div className="empty-state">No nullifiers yet</div>
          ) : (
            <div className="nullifier-list">
              {publicState.nullifierTree.map((nullifier, i) => (
                <div key={i} className="nullifier-item">
                  <div className="nullifier-index">Nullifier #{i + 1}</div>
                  <code className="nullifier-value">{nullifier.value}</code>
                  <div className="privacy-note">🔒 hash(voter_address, secret) - can't link to voter</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="key-concepts">
        <h3>How Private + Public Execution Work Together</h3>
        <div className="concepts-grid">
          <div className="concept-card">
            <h4>🔐 Private Execution</h4>
            <p>The vote choice and nullifier generation happen privately on the voter's device. No private data is stored - execution is just hidden from observers.</p>
          </div>
          <div className="concept-card">
            <h4>📊 Public State Storage</h4>
            <p>The vote tally is stored in public state (PublicMutable Map). Everyone can see the total votes, but not who voted for whom.</p>
          </div>
          <div className="concept-card">
            <h4>🚫 Nullifiers (No Notes)</h4>
            <p>Each voter generates a deterministic nullifier: hash(address, secret). This prevents double-voting without using notes. Same voter = same nullifier.</p>
          </div>
          <div className="concept-card">
            <h4>🔄 Private → Public Flow</h4>
            <p>Private function (cast_vote) calls public function (add_to_tally_public) using enqueue(). The candidate is passed directly - no encrypted notes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingDemo
