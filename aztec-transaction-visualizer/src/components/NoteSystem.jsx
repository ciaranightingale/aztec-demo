import { useState } from 'react'
import './NoteSystem.css'

function NoteSystem() {
  const [notes, setNotes] = useState([
    { id: 1, value: 100, owner: 'Alice', hash: 'hash_a1b2c3', nullifier: null, spent: false },
    { id: 2, value: 50, owner: 'Alice', hash: 'hash_d4e5f6', nullifier: null, spent: false }
  ])
  const [nullifiers, setNullifiers] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [step, setStep] = useState(1)

  const spendNote = (noteId) => {
    setSelectedNote(noteId)
    setStep(2)
  }

  const generateNullifier = () => {
    const note = notes.find(n => n.id === selectedNote)
    const nullifier = `nullifier_${note.hash.slice(5)}`

    setNotes(notes.map(n =>
      n.id === selectedNote
        ? { ...n, nullifier, spent: true }
        : n
    ))
    setNullifiers([...nullifiers, { value: nullifier, noteHash: note.hash }])
    setStep(3)
  }

  const createNewNote = () => {
    const note = notes.find(n => n.id === selectedNote)
    const newNote = {
      id: notes.length + 1,
      value: note.value,
      owner: 'Bob',
      hash: `hash_${Math.random().toString(36).substr(2, 6)}`,
      nullifier: null,
      spent: false
    }
    setNotes([...notes, newNote])
    setStep(4)
  }

  const reset = () => {
    setSelectedNote(null)
    setStep(1)
  }

  return (
    <div className="note-system">
      <div className="note-header">
        <h2>Notes & Nullifiers in Voting</h2>
        <p>Understand how Aztec uses nullifiers to prevent double-voting in the Private Voting contract</p>
      </div>

      <div className="system-overview">
        <div className="overview-card">
          <h3>Vote Notes & Nullifiers</h3>
          <p>In the Private Voting contract, your vote choice is stored as a private note:</p>
          <ul>
            <li><strong>Vote Note:</strong> Encrypted note containing your vote choice, only you can decrypt it</li>
            <li><strong>Nullifier:</strong> Derived from your address and secret key to prevent double-voting</li>
            <li><strong>Privacy-preserving:</strong> Observers see nullifier but can't link it to you or your vote</li>
            <li><strong>One vote per person:</strong> Duplicate nullifiers are rejected by the sequencer</li>
          </ul>
          <div className="emphasis-box">
            Your vote is stored as a note (private), but the nullifier and tally are public
          </div>
        </div>

        <div className="overview-card">
          <h3>How Vote Nullifiers Work</h3>
          <p>The voting contract uses a clever mechanism to ensure one vote per person:</p>
          <ul>
            <li><strong>Step 1:</strong> User executes cast_vote() privately</li>
            <li><strong>Step 2:</strong> Derives nullifier from address + secret key</li>
            <li><strong>Step 3:</strong> Sequencer checks Nullifier Tree for duplicates</li>
            <li><strong>Step 4:</strong> If unique, adds nullifier and increments tally</li>
          </ul>
        </div>

        <div className="overview-card">
          <h3>Privacy Guarantees</h3>
          <p>The nullifier system maintains privacy while preventing double-voting:</p>
          <ul>
            <li><strong>Vote choice:</strong> Completely private (never revealed)</li>
            <li><strong>Vote tally:</strong> Public (everyone can see totals)</li>
            <li><strong>Who voted:</strong> Private (nullifier can't be linked to voter)</li>
            <li><strong>Double-vote prevention:</strong> Public (nullifier tree is visible)</li>
          </ul>
        </div>
      </div>

      <div className="interactive-demo">
        <h3>Interactive Demo: Casting a Vote</h3>

        {/* Step Progress Indicator - Horizontal at top */}
        <div className="step-progress-horizontal">
          <div className={`step-item ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span className="step-text">Select Voter</span>
            <span className="step-badge private">private</span>
          </div>

          <div className="step-connector"></div>

          <div className={`step-item ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-text">Generate Nullifier</span>
            <span className="step-badge private">private</span>
          </div>

          <div className="step-connector"></div>

          <div className={`step-item ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-text">Submit Vote</span>
            <span className="step-badge public">public</span>
          </div>

          <div className="step-connector"></div>

          <div className={`step-item ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span className="step-text">Complete</span>
            <span className="step-badge public">public</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="demo-action-panel">
          {step === 1 && (
            <div className="action-content">
              <h4>Step 1: Select a Voter</h4>
              <p>Choose a voter to cast their vote. In the voting contract, each vote creates a private note.</p>
              <div className="info-box">
                <strong>Privacy note:</strong> The voter's choice is stored as an encrypted note. Only the voter can decrypt and see it.
              </div>
            </div>
          )}

          {step === 2 && selectedNote && (
            <div className="action-content">
              <h4>Step 2: Generate Vote Note & Nullifier</h4>
              <p>A private note is created with the vote choice, and a nullifier prevents double-voting. This happens during private execution.</p>
              <div className="info-box">
                <strong>Note:</strong> Encrypted vote choice<br/>
                <strong>Nullifier:</strong> hash(voter_address, secret_key)
              </div>
              <button className="action-btn" onClick={generateNullifier}>
                Create Vote Note & Nullifier
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="action-content">
              <h4>Step 3: Submit Vote</h4>
              <p>The nullifier is added to the Nullifier Tree, preventing this voter from voting again. The vote tally is updated publicly.</p>
              <div className="info-box">
                <strong>Privacy maintained:</strong> Vote note stays private (encrypted), only the nullifier and tally are public.
              </div>
              <button className="action-btn" onClick={createNewNote}>
                Complete Vote Submission
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="action-content">
              <h4>Step 4: Vote Recorded!</h4>
              <p>The vote is complete:</p>
              <ul>
                <li>✓ Vote stored as encrypted note (only voter can decrypt)</li>
                <li>✓ Voter's nullifier added to tree (prevents double-voting)</li>
                <li>✓ Vote tally publicly updated</li>
                <li>✓ Privacy maintained - no one can link nullifier to voter or their choice</li>
              </ul>
              <button className="action-btn" onClick={reset}>
                Reset Demo
              </button>
            </div>
          )}
        </div>

        <div className="demo-content">
          <div className="tree-section">
            <div className="tree-container">
              <div className="tree-header">
                <h4>Note Hash Tree</h4>
                <span className="tree-badge on-chain">on-chain</span>
                <span className="tree-badge append-only">append-only</span>
              </div>
              <p className="tree-description">Stores note commitments (hashes)</p>
              <div className="tree-items">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`tree-item note-item ${note.spent ? 'spent' : ''} ${selectedNote === note.id ? 'selected' : ''}`}
                  >
                    <div className="item-header">
                      <strong>Note #{note.id}</strong>
                      {note.spent && <span className="spent-badge">SPENT</span>}
                    </div>
                    <div className="item-details">
                      <div>Owner: {note.owner}</div>
                      <div>Value: {note.value}</div>
                      <div className="hash">Hash: {note.hash}</div>
                      {note.nullifier && (
                        <div className="nullifier-ref">→ Nullifier: {note.nullifier}</div>
                      )}
                    </div>
                    {!note.spent && step === 1 && (
                      <button className="spend-btn" onClick={() => spendNote(note.id)}>
                        Spend This Note
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="tree-note">
                Notes are never removed from this tree (append-only)
              </div>
            </div>

            <div className="tree-container">
              <div className="tree-header">
                <h4>Nullifier Tree</h4>
                <span className="tree-badge on-chain">on-chain</span>
              </div>
              <p className="tree-description">Stores nullifiers of spent notes</p>
              <div className="tree-items">
                {nullifiers.length === 0 ? (
                  <div className="empty-tree">No nullifiers yet</div>
                ) : (
                  nullifiers.map((nullifier, i) => (
                    <div key={i} className="tree-item nullifier-item">
                      <div className="item-header">
                        <strong>Nullifier #{i + 1}</strong>
                      </div>
                      <div className="item-details">
                        <div className="hash">{nullifier.value}</div>
                        <div className="note-ref">← From note: {nullifier.noteHash}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="tree-note">
                Prevents double-spending by ensuring each nullifier is unique
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="key-concepts">
        <h3>Key Voting Privacy Features</h3>
        <div className="concepts-grid">
          <div className="concept-card">
            <h4>Deterministic Nullifiers</h4>
            <p>Each voter's nullifier is derived from their address and secret key, making it unique and preventing the same person from voting twice.</p>
          </div>
          <div className="concept-card">
            <h4>Unlinkable Vote Identity</h4>
            <p>Observers can see nullifiers in the tree but cannot link them to specific voters without the secret key, preserving voter anonymity.</p>
          </div>
          <div className="concept-card">
            <h4>Efficient Double-Vote Prevention</h4>
            <p>The Indexed Merkle Tree (Nullifier Tree) allows efficient proofs that a nullifier doesn't exist, preventing double-voting with ~32 hashes instead of 254.</p>
          </div>
          <div className="concept-card">
            <h4>Private Choice, Public Tally</h4>
            <p>Vote choices remain completely private (never revealed), while the public tally is transparently updated on-chain for everyone to verify.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteSystem
