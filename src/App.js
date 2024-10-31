import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Shield, AlertOctagon, CheckCircle2, MessageCircleQuestion, ListTree, ArrowLeft, FileWarning } from 'lucide-react';

const CyberIncidentTriageSystem = () => {
  const INCIDENT_TYPES = [
    {
      id: 'phishing',
      name: 'Phishing Attack',
      icon: AlertTriangle,
      description: "A social engineering attack designed to trick individuals into revealing sensitive information or installing malicious software.",
      risks: [
        "Credential theft",
        "Unauthorised account access",
        "Potential data breach"
      ],
      immediateActions: [
        "Do not click any links in the suspicious email",
        "Do not download any attachments",
        "Triage the ticket to IT Security - if unsure, triage to CEN's queue",
        "Message the Cyber Security Analyst so they are aware"
      ],
      questions: [
        {
          id: 'email-received',
          text: "Has a suspicious email been received?",
          type: 'boolean'
        },
        {
          id: 'credentials-entered',
          text: "Were any credentials entered on a suspicious site?",
          type: 'boolean'
        },
        {
          id: 'email-spread',
          text: "Has this email been received by multiple employees?",
          type: 'boolean'
        },
        {
          id: 'sensitive-data-exposure',
          text: "Does the phishing attempt involve potential sensitive data exposure?",
          type: 'boolean'
        }
      ]
    },
    {
      id: 'ddos',
      name: 'DDoS Attack',
      icon: ShieldAlert,
      description: "A malicious attempt to overwhelm a network or service, disrupting normal traffic and causing service downtime.",
      risks: [
        "Service downtime",
        "Potential reputation damage",
        "Loss of productivity"
      ],
      immediateActions: [
        "Triage the ticket to IT Security",
        "Be aware of other tickets that may come in, anything from slow internet to slow logins",
        "Alert IT Security by Teams message to analyse traffic patterns",
        "Escalate the incident if critical services are impacted"
      ],
      questions: [
        {
          id: 'service-impact',
          text: "Are critical services experiencing significant performance degradation?",
          type: 'boolean'
        },
        {
          id: 'traffic-source',
          text: "Can the unusual traffic be traced to specific sources?",
          type: 'boolean'
        },
        {
          id: 'business-critical-systems',
          text: "Are business-critical systems being targeted?",
          type: 'boolean'
        },
        {
          id: 'ongoing-attack',
          text: "Is the attack currently active?",
          type: 'boolean'
        }
      ]
    },
    {
      id: 'malware',
      name: 'Malware Infection',
      icon: AlertOctagon,
      questions: [
        {
          id: 'suspicious-file-executed',
          text: "Has an unexpected or suspicious file been executed?",
          type: 'boolean'
        },
        {
          id: 'system-behavior-change',
          text: "Have you noticed unusual system behavior?",
          type: 'boolean'
        },
        {
          id: 'multiple-systems-affected',
          text: "Are multiple systems showing similar symptoms?",
          type: 'boolean'
        },
        {
          id: 'antivirus-triggered',
          text: "Has the antivirus detected any threats?",
          type: 'boolean'
        },
        {
          id: 'ransomware-check',
          text: "Are files suddenly encrypted or inaccessible?",
          type: 'boolean'
        },
        {
          id: 'ransom-message',
          text: "Has a ransom message appeared?",
          type: 'boolean'
        }
      ],
      subTypes: [
        {
          id: 'ransomware',
          name: 'Ransomware',
          additionalQuestions: [
            {
              id: 'backup-systems',
              text: "Are backup systems functional?",
              type: 'boolean'
            },
            {
              id: 'critical-data-impacted',
              text: "Does the encryption affect critical business data?",
              type: 'boolean'
            }
          ]
        }
      ]
    },
    {
      id: 'website-defacement',
      name: 'Website Defacement',
      icon: Shield,
      description: "An attack that alters the appearance or content of a website, potentially causing reputational damage and data exposure.",
      risks: [
        "Reputational damage",
        "Loss of user trust",
        "Potential data leak"
      ],
      immediateActions: [
        "Notify the web development team",
        "Triage to IT Security for further investigation"
      ],
      questions: [
        {
          id: 'unauthorized-content',
          text: "Has unauthorized content appeared on the website?",
          type: 'boolean'
        },
        {
          id: 'site-functionality-altered',
          text: "Are site functions or appearance significantly changed?",
          type: 'boolean'
        },
        {
          id: 'admin-access-compromised',
          text: "Is there evidence of compromised admin credentials?",
          type: 'boolean'
        },
        {
          id: 'data-leak-suspected',
          text: "Is there a potential data leak associated with the defacement?",
          type: 'boolean'
        }
      ]
    }
  ];

  const THREAT_LEVELS = {
    5: {
      name: "Normal Operations",
      description: "No significant threat detected. Continue routine monitoring.",
      color: "text-green-600",
      icon: CheckCircle2
    },
    4: {
      name: "Elevated Alert",
      description: "Potential threat identified. Increase vigilance and monitoring.",
      color: "text-yellow-600",
      icon: Shield
    },
    3: {
      name: "Incident Detected",
      description: "Active threat potentially spreading. Immediate investigation required.",
      color: "text-orange-600",
      icon: ShieldAlert
    },
    2: {
      name: "Major Incident",
      description: "Significant security breach. Activate full incident response.",
      color: "text-red-600",
      icon: AlertTriangle
    },
    1: {
      name: "Crisis",
      description: "Severe security compromise. Immediate comprehensive action needed.",
      color: "text-red-800",
      icon: AlertOctagon
    }
  };

  const [stage, setStage] = useState('description');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [threatLevel, setThreatLevel] = useState(null);
  const [selectedSubType, setSelectedSubType] = useState(null);
  const [error, setError] = useState('');

  const suggestIncidentType = (description) => {
    if (!description) return null;

    const lowercaseDesc = description.toLowerCase();
    const keywords = {
      'phishing': ['email', 'phish', 'credential', 'login', 'password'],
      'ddos': ['traffic', 'slow', 'performance', 'network', 'overwhelm'],
      'malware': ['virus', 'infected', 'file', 'encrypt', 'ransom', 'suspicious'],
      'website-defacement': ['website', 'hacked', 'changed', 'content', 'admin']
    };

    const matchedTypes = Object.entries(keywords).filter(([_, typeKeywords]) =>
        typeKeywords.some(keyword => lowercaseDesc.includes(keyword))
    );

    return matchedTypes.length > 0
        ? INCIDENT_TYPES.find(type => type.id === matchedTypes[0][0])
        : null;
  };

  const handleDescriptionSubmit = () => {
    const trimmedDescription = incidentDescription.trim();

    if (!trimmedDescription) {
      setError('Please provide a description of the incident.');
      return;
    }

    const suggestedIncident = suggestIncidentType(trimmedDescription);

    if (suggestedIncident) {
      setSelectedIncident(suggestedIncident);
      setError('');

      if (suggestedIncident.subTypes && suggestedIncident.subTypes.length === 1) {
        setSelectedSubType(suggestedIncident.subTypes[0]);
      }

      // Directly set stage to questions and reset current step
      setStage('questions');
      setCurrentStep(0); // Ensure we start at the first question
    } else {
      setStage('selection');
    }
  };
  // Render description input stage
  const renderDescriptionInput = () => {
    return (
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <MessageCircleQuestion className="mr-3 text-blue-500" size={40} />
            <h2 className="text-xl font-semibold">Describe the Incident</h2>
          </div>
          {error && (
              <div className="text-red-500 text-sm mb-4 text-center">
                {error}
              </div>
          )}
          <textarea
              value={incidentDescription}
              onChange={(e) => {
                setIncidentDescription(e.target.value);
                setError('');
              }}
              placeholder="Describe what's happening in as much detail as possible. For example: 'I received a suspicious email asking me to reset my password'"
              className="w-full h-32 p-3 border rounded mb-4"
              aria-label="Incident description"
          />
          <div className="flex gap-4">
            <button
                onClick={handleDescriptionSubmit}
                className="flex-grow px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label="Submit incident description"
            >
              Next
            </button>
            <button
                onClick={() => setStage('selection')}
                className="flex-grow px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                aria-label="Select incident type directly"
            >
              <div className="flex items-center justify-center">
                <ListTree className="mr-2" size={20} />
                Select Category
              </div>
            </button>
          </div>
        </div>
    );
  };


  // Threat level calculation utility
  const calculateThreatLevel = (responses) => {
    const responseValues = Object.values(responses).filter(r => r === true).length;

    if (responseValues >= 3) return 2; // Major Incident
    if (responseValues === 2) return 3; // Incident Detected
    if (responseValues === 1) return 4; // Elevated Alert
    return 5; // Normal Operations
  };
  // New method to generate detailed incident report
  const generateIncidentReport = () => {
    const currentLevel = THREAT_LEVELS[threatLevel];
    const foundIncident = INCIDENT_TYPES.find(inc => inc.id === selectedIncident?.id);

    if (!foundIncident) {
      return <p>Error: No incident found.</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FileWarning className="mr-3 text-orange-500" size={40} />
            <h2 className="text-2xl font-bold">Incident Classification Report</h2>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg">Incident Type</h3>
            <p className="text-gray-700">{foundIncident.name}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-gray-700">{foundIncident.description}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg">Potential Risks</h3>
            <ul className="list-disc list-inside text-gray-700">
              {foundIncident.risks?.map((risk, index) => (
                  <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg">Immediate Actions</h3>
            <ul className="list-decimal list-inside text-gray-700">
              {foundIncident.immediateActions?.map((action, index) => (
                  <li key={index}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg">User Responses</h3>
            <ul className="list-disc list-inside text-gray-700">
              {foundIncident.questions.map((question) => (
                  <li key={question.id}>
                    <strong>{question.text}:</strong> {responses[question.id] ? "Yes" : "No"}
                  </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold text-lg ${currentLevel?.color}`}>
              Threat Level: {currentLevel?.name}
            </h3>
            <p className="text-gray-700">{currentLevel?.description}</p>
          </div>
        </div>
    );
  };

  // Handle response for each question
  const handleResponse = (response) => {
    let currentQuestions = selectedIncident.questions;

    // If we're in a sub-type (like ransomware), include its questions
    if (selectedSubType && selectedSubType.additionalQuestions) {
      currentQuestions = [...currentQuestions, ...selectedSubType.additionalQuestions];
    }

    const currentQuestion = currentQuestions[currentStep];
    const updatedResponses = {
      ...responses,
      [currentQuestion.id]: response
    };
    setResponses(updatedResponses);

    // Move to next step or calculate threat level
    if (currentStep < currentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate final threat level
      const level = calculateThreatLevel(updatedResponses);
      setThreatLevel(level);
    }
  };

// Reset entire assessment
  const resetAssessment = () => {
    setSelectedIncident(null);
    setSelectedSubType(null);
    setCurrentStep(0);
    setResponses({});
    setThreatLevel(null);
    setStage('description'); // Reset to initial description stage
    setIncidentDescription(''); // Clear previous description
  };

  // Render threat level result
  const renderThreatLevelResult = () => {
    const currentLevel = THREAT_LEVELS[threatLevel];
    const Icon = currentLevel.icon;

    return (
        <div className="p-6">
          {generateIncidentReport()}

          <div className="text-center mt-6">
            <button
                onClick={resetAssessment}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start New Assessment
            </button>
          </div>
        </div>
    );
  };
// Update the renderIncidentSelection to use the new selectIncident method
  const renderIncidentSelection = () => {
    return (
        <div className="p-4">
          <div className="mb-4">
            <button
                onClick={() => setStage('description')}
                className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Description
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {INCIDENT_TYPES.map((incident) => {
              const Icon = incident.icon;
              return (
                  <div key={incident.id} className="flex flex-col">
                    <button
                        onClick={() => selectIncident(incident)}
                        className="p-4 border rounded hover:bg-blue-50 transition flex items-center"
                    >
                      <Icon className="mr-3" />
                      {incident.name}
                    </button>

                    {/* Render sub-types if available */}
                    {incident.subTypes && incident.subTypes.length > 1 && (
                        <div className="mt-2 ml-4 space-y-2">
                          {incident.subTypes.map((subType) => (
                              <button
                                  key={subType.id}
                                  onClick={() => selectIncident(incident, subType)}
                                  className="text-sm text-gray-600 hover:text-blue-600"
                              >
                                {subType.name}
                              </button>
                          ))}
                        </div>
                    )}
                  </div>
              );
            })}
          </div>
        </div>
    );
  };

  // Render questionnaire
  const renderQuestionnaire = () => {
    let currentQuestions = selectedIncident.questions;

    // If we're in a sub-type (like ransomware), include its questions
    if (selectedSubType && selectedSubType.additionalQuestions) {
      currentQuestions = [...currentQuestions, ...selectedSubType.additionalQuestions];
    }

    const currentQuestion = currentQuestions[currentStep];

    return (
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
          <div className="flex justify-center gap-4">
            <button
                onClick={() => handleResponse(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Yes
            </button>
            <button
                onClick={() => handleResponse(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              No
            </button>
          </div>
        </div>
    );
  };

  const renderContent = () => {
    // If threat level is calculated, show result
    if (threatLevel) return renderThreatLevelResult();

    // Comprehensive stage management
    switch(stage) {
      case 'description':
        return renderDescriptionInput();
      case 'selection':
        return renderIncidentSelection();
      case 'questions':
        // Ensure we have a selected incident before rendering questions
        if (selectedIncident) {
          return renderQuestionnaire();
        }
        // Fallback to description if something goes wrong
        return renderDescriptionInput();
      default:
        return renderDescriptionInput();
    }
  };
// Modify the incident selection method to explicitly set stage
  const selectIncident = (incident, subType = null) => {
    setSelectedIncident(incident);
    setCurrentStep(0);

    // Handle sub-types if present
    if (incident.subTypes && incident.subTypes.length > 0) {
      if (subType) {
        setSelectedSubType(subType);
      } else if (incident.subTypes.length === 1) {
        setSelectedSubType(incident.subTypes[0]);
      }
    }
    // Explicitly set stage to questions
    setStage('questions');
  };
  return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-blue-500 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">DEFCON Triage Helper</h1>
        </div>
        {renderContent()}
      </div>
  );
};

export default CyberIncidentTriageSystem;