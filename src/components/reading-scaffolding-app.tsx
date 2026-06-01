"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APP_SUBTITLE,
  APP_TITLE,
  OVERVIEW_PRE_READING,
  OVERVIEW_SKILLS,
  PART_ONE_PRE_READING,
  PART_TWO_PRE_READING,
  QUESTIONS,
  SECTION_TABS,
  SUMMARY_SKILLS,
  SUMMARY_TIPS,
  type ReadingQuestion,
  type SectionId,
} from "@/lib/reading-scaffolding-data";

type ModalState = {
  open: boolean;
  emoji: string;
  title: string;
  message: string;
  isCorrect: boolean;
};

const TOTAL_QUESTIONS = QUESTIONS.length;
const QUESTION_LOOKUP = Object.fromEntries(QUESTIONS.map((question) => [question.id, question])) as Record<number, ReadingQuestion>;
const PART_ONE_QUESTIONS = QUESTIONS.filter((question) => question.section === "part1");
const PART_TWO_QUESTIONS = QUESTIONS.filter((question) => question.section === "part2");
const PART_ONE_IDS = QUESTIONS.filter((question) => question.section === "part1").map((question) => question.id);
const PART_TWO_IDS = QUESTIONS.filter((question) => question.section === "part2").map((question) => question.id);

function splitExplanation(value: string) {
  const [title, ...rest] = value.split("\n\n");

  return {
    title,
    body: rest.join("\n\n"),
  };
}

function isSectionComplete(answered: Record<number, string>, questionIds: number[]) {
  return questionIds.every((questionId) => Boolean(answered[questionId]));
}

function ClueSpan({ clueId, activeQuestionId, children }: { clueId: string; activeQuestionId: number | null; children: React.ReactNode }) {
  const activeQuestion = activeQuestionId ? QUESTION_LOOKUP[activeQuestionId] : null;
  const clueIds = activeQuestion?.clueIds ?? [];
  const isActive = clueIds.includes(clueId);
  const isPrimary = isActive && clueIds[0] === clueId;

  return (
    <span
      className={`highlight-clue${isActive ? " glow" : ""}${isPrimary ? " clue-badge" : ""}`}
      data-clue={clueId}
    >
      {children}
    </span>
  );
}

function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  onHintToggle,
  onStrategyToggle,
  hintVisible,
  strategyVisible,
}: {
  question: ReadingQuestion;
  selectedAnswer?: string;
  onAnswer: (questionId: number, value: string) => void;
  onHintToggle: (questionId: number) => void;
  onStrategyToggle: (questionId: number) => void;
  hintVisible: boolean;
  strategyVisible: boolean;
}) {
  const isAnswered = Boolean(selectedAnswer);
  const questionStateClass = !selectedAnswer
    ? ""
    : selectedAnswer === question.answer
      ? " answered-correct"
      : " answered-wrong";
  const explanation = splitExplanation(question.explanation);

  return (
    <div className={`question-card${questionStateClass}`} id={`qcard-${question.id}`}>
      <div className="q-number">{question.numberLabel}</div>
      <div className="q-text">{question.prompt}</div>

      <ul className="options-list">
        {question.options.map((option) => {
          const isCorrect = isAnswered && option.value === question.answer;
          const isWrong = isAnswered && selectedAnswer === option.value && option.value !== question.answer;

          return (
            <li key={`${question.id}-${option.value}`}>
              <button
                type="button"
                className={`option-btn${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}${isAnswered ? " disabled" : ""}`}
                data-q={question.id}
                data-val={option.value}
                disabled={isAnswered}
                onClick={() => onAnswer(question.id, option.value)}
              >
                <span className="opt-letter">{option.value}</span>
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="hint-row">
        <button className="hint-btn" type="button" onClick={() => onHintToggle(question.id)}>
          <i className="fas fa-lightbulb"></i> Show Hint
        </button>
        <button
          className="hint-btn hint-btn-strategy"
          type="button"
          onClick={() => onStrategyToggle(question.id)}
        >
          <i className="fas fa-graduation-cap"></i> Reading Strategy
        </button>
      </div>

      <div className={`hint-box${hintVisible ? " visible" : ""}`} id={`hint-${question.id}`}>
        <strong>&#128161; Hint:</strong> {question.hint}
      </div>

      <div className={`reading-strategy${strategyVisible ? " visible" : ""}`} id={`strategy-${question.id}`}>
        <i className="fas fa-graduation-cap"></i> <strong>{question.strategy}</strong>
      </div>

      <div className={`explain-box${isAnswered ? " visible" : ""}`} id={`explain-${question.id}`}>
        <strong>&#9989; {explanation.title}</strong>
        <br />
        <br />
        {explanation.body}
      </div>
    </div>
  );
}

export function ReadingScaffoldingApp() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [answered, setAnswered] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [visibleHints, setVisibleHints] = useState<Record<number, boolean>>({});
  const [visibleStrategies, setVisibleStrategies] = useState<Record<number, boolean>>({});
  const [activeHighlightQuestion, setActiveHighlightQuestion] = useState<number | null>(null);
  const [questionIndexes, setQuestionIndexes] = useState({
    part1: 0,
    part2: 0,
  });
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    emoji: "🎉",
    title: "Correct!",
    message: "Great work!",
    isCorrect: true,
  });

  const answeredCount = Object.keys(answered).length;
  const partOneComplete = isSectionComplete(answered, PART_ONE_IDS);
  const partTwoComplete = isSectionComplete(answered, PART_TWO_IDS);
  const summaryComplete = answeredCount === TOTAL_QUESTIONS;
  const currentPartOneQuestion = PART_ONE_QUESTIONS[questionIndexes.part1];
  const currentPartTwoQuestion = PART_TWO_QUESTIONS[questionIndexes.part2];
  const summaryMessage = useMemo(() => {
    if (score === TOTAL_QUESTIONS) {
      return "Perfect score! You're a reading superstar!";
    }

    if (score >= 4) {
      return "Great job! Keep up the good work!";
    }

    if (score >= 2) {
      return "Good effort! Review the hints and try again.";
    }

    return "Keep practicing - use the hints to help you next time!";
  }, [score]);

  useEffect(() => {
    if (!activeHighlightQuestion) {
      return;
    }

    const firstClueId = QUESTION_LOOKUP[activeHighlightQuestion]?.clueIds[0];

    if (!firstClueId) {
      return;
    }

    const timer = window.setTimeout(() => {
      const selector = `.section-panel.active .highlight-clue[data-clue="${firstClueId}"]`;
      const firstHighlight = document.querySelector(selector) as HTMLElement | null;

      if (!firstHighlight) {
        return;
      }

      const leftPane = firstHighlight.closest(".split-left") as HTMLElement | null;

      if (leftPane) {
        const paneRect = leftPane.getBoundingClientRect();
        const clueRect = firstHighlight.getBoundingClientRect();
        const scrollTarget = leftPane.scrollTop + (clueRect.top - paneRect.top) - paneRect.height / 2 + clueRect.height / 2;
        leftPane.scrollTo({ top: scrollTarget, behavior: "smooth" });
        return;
      }

      firstHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [activeHighlightQuestion, activeSection]);

  const switchSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    setActiveHighlightQuestion(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (questionId: number, value: string) => {
    if (answered[questionId]) {
      return;
    }

    const question = QUESTION_LOOKUP[questionId];
    const isCorrect = value === question.answer;

    setAnswered((current) => ({ ...current, [questionId]: value }));
    if (isCorrect) {
      setScore((current) => current + 1);
    }

    setActiveHighlightQuestion(questionId);
    setModalState({
      open: true,
      emoji: isCorrect ? "🎉" : "🤔",
      title: isCorrect ? "Correct!" : "Not quite!",
      message: isCorrect
        ? "Well done! You found the right answer."
        : "The correct answer is highlighted in green. Read the explanation below.",
      isCorrect,
    });
  };

  const handleHintToggle = (questionId: number) => {
    setVisibleHints((current) => {
      const nextVisible = !current[questionId];

      if (nextVisible) {
        setActiveHighlightQuestion(questionId);
      } else if (!answered[questionId]) {
        setActiveHighlightQuestion((active) => (active === questionId ? null : active));
      }

      return {
        ...current,
        [questionId]: nextVisible,
      };
    });
  };

  const handleStrategyToggle = (questionId: number) => {
    setVisibleStrategies((current) => ({
      ...current,
      [questionId]: !current[questionId],
    }));
  };

  const handleQuestionStep = (sectionId: "part1" | "part2", direction: "previous" | "next") => {
    const sectionQuestions = sectionId === "part1" ? PART_ONE_QUESTIONS : PART_TWO_QUESTIONS;

    setQuestionIndexes((current) => {
      const currentIndex = current[sectionId];
      const nextIndex = direction === "next"
        ? Math.min(currentIndex + 1, sectionQuestions.length - 1)
        : Math.max(currentIndex - 1, 0);

      if (nextIndex === currentIndex) {
        return current;
      }

      return {
        ...current,
        [sectionId]: nextIndex,
      };
    });

    setActiveHighlightQuestion(null);
  };

  const resetAll = () => {
    setAnswered({});
    setScore(0);
    setVisibleHints({});
    setVisibleStrategies({});
    setActiveHighlightQuestion(null);
    setQuestionIndexes({
      part1: 0,
      part2: 0,
    });
    setModalState((current) => ({ ...current, open: false }));
    setActiveSection("overview");
  };

  const renderOverviewPreview = () => (
    <div className="webpage-sim">
      <div className="webpage-topbar">
        <span className="browser-dot r"></span>
        <span className="browser-dot y"></span>
        <span className="browser-dot g"></span>
        <div className="url-bar">www.happyicecream.com.hk</div>
      </div>
      <div className="webpage-body">
        <div className="ad-header">
          <div className="ice-cream-deco">&#127846;&#127752;&#127848;</div>
          <h2>Try Our New Rainbow Ice Cream!</h2>
          <p className="ad-subtitle">a mix of delicious cherry, banana, melon and blueberry flavours</p>
        </div>
        <div className="price-grid">
          <div className="price-card"><div className="label">Mini Cup</div><div className="price">$30</div></div>
          <div className="price-card"><div className="label">Single Scoop</div><div className="price">$38</div></div>
          <div className="price-card"><div className="label">Family Pack</div><div className="price">$105</div></div>
        </div>
        <div className="special-banner">
          <h3>This Week&apos;s Special Offer</h3>
          <p>(16-22 July)<br />Buy 1 scoop and get 1 scoop FREE!<br />(for the Sha Tin branch only)</p>
        </div>
        <div className="comment-heading-wrap">
          <div className="comment-heading">
            <i className="fas fa-comment-dots comment-heading-icon"></i>
            Comments
          </div>
          <div className="comment-item"><div className="comment-meta"><span className="comment-user">Jimmy1234</span><span className="comment-date">14 July 20XX</span></div><p className="comment-text">I like vanilla and chocolate flavours more. I prefer these ordinary flavours to the strange new mix.</p></div>
          <div className="comment-item"><div className="comment-meta"><span className="comment-user">CoolChloe01</span><span className="comment-date">2 July 20XX</span></div><p className="comment-text">I&apos;m coming back for more!</p></div>
          <div className="comment-item"><div className="comment-meta"><span className="comment-user">KatyLovesFood</span><span className="comment-date">28 June 20XX</span></div><p className="comment-text">Looks good but tastes average...</p></div>
          <div className="comment-item"><div className="comment-meta"><span className="comment-user">HappyDave</span><span className="comment-date">19 June 20XX</span></div><p className="comment-text">I ordered the family pack online. When I opened it... Ugh! The ice cream melted and the colours mixed together. What a mess! It should be called &apos;Typhoon Ice Cream&apos; instead!</p></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1><i className="fas fa-book-reader"></i> {APP_TITLE}</h1>
        <p>{APP_SUBTITLE}</p>
      </div>

      <div className="nav-tabs" id="navTabs">
        {SECTION_TABS.map((tab) => {
          const isCompleted = tab.id === "part1"
            ? partOneComplete
            : tab.id === "part2"
              ? partTwoComplete
              : tab.id === "summary"
                ? summaryComplete
                : false;

          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab${activeSection === tab.id ? " active" : ""}${isCompleted ? " completed-tab" : ""}`}
              data-section={tab.id}
              onClick={() => switchSection(tab.id)}
            >
              <i className={tab.iconClass}></i> {tab.label} <span className="tab-check">&check;</span>
            </button>
          );
        })}
      </div>

      <div className={`section-panel${activeSection === "overview" ? " active" : ""}`} id="section-overview">
        <div className="narrow">
          <div className="card">
            <div className="card-title">
              <span className="icon icon-info"><i className="fas fa-info"></i></span>
              About This Reading
            </div>
            <p className="lead-copy">The reading below is a <strong>webpage of an ice-cream shop</strong>. It has an advertisement and a comments section. Have a quick look at it!</p>
          </div>

          <div className="card">
            <div className="card-title"><span className="icon icon-bulb"><i className="fas fa-lightbulb"></i></span> Pre-reading Questions</div>
            <ul className="pre-reading-list">
              {OVERVIEW_PRE_READING.map((question) => (
                <li key={question}><i className="fas fa-question-circle"></i> {question}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="card-title"><span className="icon icon-globe"><i className="fas fa-globe"></i></span> The Webpage</div>
            {renderOverviewPreview()}
          </div>

          <div className="card">
            <div className="card-title"><span className="icon icon-brain"><i className="fas fa-brain"></i></span> Reading Skills You&apos;ll Practice</div>
            <div>
              {OVERVIEW_SKILLS.map((skill) => (
                <span key={skill.label} className="skill-tag"><i className={skill.iconClass}></i> {skill.label}</span>
              ))}
            </div>
          </div>

          <div className="section-actions">
            <button className="restart-btn restart-btn-start" type="button" onClick={() => switchSection("part1")}>
              Start Part 1 <i className="fas fa-arrow-right icon-after"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`section-panel${activeSection === "part1" ? " active" : ""}`} id="section-part1">
        <div className="split-layout">
          <div className="split-left">
            <div className="pane-label"><i className="fas fa-book-open"></i> Reading Passage</div>
            <div className="card card-stack-tight">
              <div className="card-title card-title-compact"><span className="icon icon-ad"><i className="fas fa-ad"></i></span> Part 1: The Advertisement</div>
              <ul className="pre-reading-list">
                {PART_ONE_PRE_READING.map((question) => (
                  <li key={question}><i className="fas fa-question-circle"></i> {question}</li>
                ))}
              </ul>
            </div>

            <div className="card card-compact">
              <div className={`webpage-sim${activeSection === "part1" && activeHighlightQuestion && QUESTION_LOOKUP[activeHighlightQuestion].section === "part1" ? " clue-active" : ""}`} id="article-part1">
                <div className="webpage-topbar">
                  <span className="browser-dot r"></span>
                  <span className="browser-dot y"></span>
                  <span className="browser-dot g"></span>
                  <div className="url-bar">www.happyicecream.com.hk</div>
                </div>
                <div className="webpage-body">
                  <div className="ad-header">
                    <div className="ice-cream-deco">&#127846;&#127752;&#127848;</div>
                    <h2>Try Our New Rainbow Ice Cream!</h2>
                    <p className="ad-subtitle">a mix of delicious <ClueSpan clueId="q1" activeQuestionId={activeHighlightQuestion}>cherry, banana, melon and blueberry</ClueSpan> flavours</p>
                  </div>
                  <div className="price-grid">
                    <div className="price-card"><div className="label">Mini Cup</div><div className="price">$30</div></div>
                    <div className="price-card"><div className="label">Single Scoop</div><div className="price">$38</div></div>
                    <div className="price-card"><div className="label">Family Pack</div><div className="price">$105</div></div>
                  </div>
                  <div className="special-banner">
                    <h3>This Week&apos;s Special Offer</h3>
                    <p>
                      <ClueSpan clueId="q3" activeQuestionId={activeHighlightQuestion}>(<ClueSpan clueId="q3b" activeQuestionId={activeHighlightQuestion}>16-22 July</ClueSpan>)</ClueSpan>
                      <br />
                      Buy 1 scoop and get 1 scoop FREE!
                      <br />
                      <ClueSpan clueId="q2" activeQuestionId={activeHighlightQuestion}>(for the Sha Tin branch only)</ClueSpan>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="split-right">
            <div className="pane-label pane-label-question"><i className="fas fa-pen-fancy"></i> Questions</div>
            <div className="card card-stack-tight question-progress-card">
              <div className="q-number">Question {questionIndexes.part1 + 1} of {PART_ONE_QUESTIONS.length}</div>
              <p className="question-progress-copy">Answer one question at a time, then move to the next one.</p>
            </div>
            {currentPartOneQuestion ? (
              <QuestionCard
                key={currentPartOneQuestion.id}
                question={currentPartOneQuestion}
                selectedAnswer={answered[currentPartOneQuestion.id]}
                onAnswer={handleAnswer}
                onHintToggle={handleHintToggle}
                onStrategyToggle={handleStrategyToggle}
                hintVisible={Boolean(visibleHints[currentPartOneQuestion.id])}
                strategyVisible={Boolean(visibleStrategies[currentPartOneQuestion.id])}
              />
            ) : null}
            <div className="question-nav">
              <button
                className="nav-btn nav-btn-previous"
                type="button"
                disabled={questionIndexes.part1 === 0}
                onClick={() => handleQuestionStep("part1", "previous")}
              >
                Previous
              </button>
              <button
                className="nav-btn nav-btn-next"
                type="button"
                disabled={questionIndexes.part1 === PART_ONE_QUESTIONS.length - 1}
                onClick={() => handleQuestionStep("part1", "next")}
              >
                Next
              </button>
            </div>
            <div className="section-actions">
              <button className="restart-btn restart-btn-continue" type="button" onClick={() => switchSection("part2")}>
                Continue to Part 2 <i className="fas fa-arrow-right icon-after"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`section-panel${activeSection === "part2" ? " active" : ""}`} id="section-part2">
        <div className="split-layout">
          <div className="split-left">
            <div className="pane-label"><i className="fas fa-book-open"></i> Reading Passage</div>
            <div className="card card-stack-tight">
              <div className="card-title card-title-compact"><span className="icon icon-comments"><i className="fas fa-comments"></i></span> Part 2: The Comments</div>
              <ul className="pre-reading-list">
                {PART_TWO_PRE_READING.map((question) => (
                  <li key={question}><i className="fas fa-question-circle"></i> {question}</li>
                ))}
              </ul>
            </div>

            <div className="card card-compact">
              <div className={`webpage-sim${activeSection === "part2" && activeHighlightQuestion && QUESTION_LOOKUP[activeHighlightQuestion].section === "part2" ? " clue-active" : ""}`} id="article-part2">
                <div className="webpage-topbar">
                  <span className="browser-dot r"></span>
                  <span className="browser-dot y"></span>
                  <span className="browser-dot g"></span>
                  <div className="url-bar">www.happyicecream.com.hk - Comments</div>
                </div>
                <div className="webpage-body">
                  <div className="comment-item">
                    <div className="comment-meta"><span className="comment-user">Jimmy1234</span><span className="comment-date">14 July 20XX</span></div>
                    <p className="comment-text">I like vanilla and chocolate flavours more. I prefer these <span className="vocab-word" tabIndex={0}><ClueSpan clueId="q4" activeQuestionId={activeHighlightQuestion}>ordinary</ClueSpan><span className="vocab-tip">&#128161; <strong>ordinary</strong> = common, usual, not special</span></span> flavours to the <ClueSpan clueId="q4b" activeQuestionId={activeHighlightQuestion}>strange</ClueSpan> new mix.</p>
                  </div>
                  <div className="comment-item">
                    <div className="comment-meta"><span className="comment-user">CoolChloe01</span><span className="comment-date">2 July 20XX</span></div>
                    <p className="comment-text"><ClueSpan clueId="q6" activeQuestionId={activeHighlightQuestion}>I&apos;m coming back for more!</ClueSpan></p>
                  </div>
                  <div className="comment-item">
                    <div className="comment-meta"><span className="comment-user">KatyLovesFood</span><span className="comment-date">28 June 20XX</span></div>
                    <p className="comment-text">Looks good but tastes average...</p>
                  </div>
                  <div className="comment-item">
                    <div className="comment-meta"><span className="comment-user">HappyDave</span><span className="comment-date">19 June 20XX</span></div>
                    <p className="comment-text">I ordered the family pack online. When I opened it... <span className="vocab-word" tabIndex={0}><ClueSpan clueId="q5" activeQuestionId={activeHighlightQuestion}>Ugh!</ClueSpan><span className="vocab-tip">&#128161; <strong>Ugh!</strong> = a sound expressing disgust or displeasure</span></span> The ice cream <ClueSpan clueId="q5b" activeQuestionId={activeHighlightQuestion}>melted</ClueSpan> and the colours mixed together. <ClueSpan clueId="q5c" activeQuestionId={activeHighlightQuestion}>What a mess!</ClueSpan> It should be called &apos;Typhoon Ice Cream&apos; instead!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="split-right">
            <div className="pane-label pane-label-question"><i className="fas fa-pen-fancy"></i> Questions</div>
            <div className="card card-stack-tight question-progress-card">
              <div className="q-number">Question {questionIndexes.part2 + 1} of {PART_TWO_QUESTIONS.length}</div>
              <p className="question-progress-copy">Stay on one comment question, then step forward when you are ready.</p>
            </div>
            {currentPartTwoQuestion ? (
              <QuestionCard
                key={currentPartTwoQuestion.id}
                question={currentPartTwoQuestion}
                selectedAnswer={answered[currentPartTwoQuestion.id]}
                onAnswer={handleAnswer}
                onHintToggle={handleHintToggle}
                onStrategyToggle={handleStrategyToggle}
                hintVisible={Boolean(visibleHints[currentPartTwoQuestion.id])}
                strategyVisible={Boolean(visibleStrategies[currentPartTwoQuestion.id])}
              />
            ) : null}
            <div className="question-nav">
              <button
                className="nav-btn nav-btn-previous"
                type="button"
                disabled={questionIndexes.part2 === 0}
                onClick={() => handleQuestionStep("part2", "previous")}
              >
                Previous
              </button>
              <button
                className="nav-btn nav-btn-next"
                type="button"
                disabled={questionIndexes.part2 === PART_TWO_QUESTIONS.length - 1}
                onClick={() => handleQuestionStep("part2", "next")}
              >
                Next
              </button>
            </div>
            <div className="section-actions">
              <button className="restart-btn" type="button" onClick={() => switchSection("summary")}>
                View Summary <i className="fas fa-trophy icon-after"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`section-panel${activeSection === "summary" ? " active" : ""}`} id="section-summary">
        <div className="narrow">
          <div className="card celebration-card" id="celebrationCard">
            <div className="trophy">&#127942;</div>
            <h2>Great Job!</h2>
            <p>You&apos;ve completed Reading 1 for Level 1!</p>
            <div className="final-score" id="finalScore">{score}/{TOTAL_QUESTIONS}</div>
            <p className="score-note" id="finalMsg">{summaryMessage}</p>
          </div>

          <div className="card">
            <div className="card-title"><span className="icon icon-stars"><i className="fas fa-star"></i></span> Reading Skills You Practiced</div>
            <ul className="summary-skills">
              {SUMMARY_SKILLS.map((skill) => (
                <li key={skill.title}>
                  <span className={`skill-icon ${skill.iconClassName}`}><i className={skill.iconClass}></i></span>
                  <span><strong>{skill.title}</strong> - {skill.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="card-title"><span className="icon icon-tip"><i className="fas fa-lightbulb"></i></span> Tips for Next Time</div>
            <ul className="summary-skills">
              {SUMMARY_TIPS.map((tip) => (
                <li key={tip.text}>
                  <span className={`skill-icon ${tip.iconClassName}`}><i className={tip.iconClass}></i></span>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="section-actions">
            <button className="restart-btn" type="button" onClick={resetAll}><i className="fas fa-redo icon-spacer"></i> Start Over</button>
          </div>
        </div>
      </div>

      {modalState.open ? (
        <div className="modal-overlay show" id="modalOverlay" onClick={() => setModalState((current) => ({ ...current, open: false }))}>
          <div className="modal-box" onClick={(event) => event.stopPropagation()}>
            <div className="modal-emoji" id="modalEmoji">{modalState.emoji}</div>
            <div className="modal-title" id="modalTitle">{modalState.title}</div>
            <div className="modal-msg" id="modalMsg">{modalState.message}</div>
            <button
              className={`modal-ok ${modalState.isCorrect ? "green" : "pink"}`}
              id="modalBtn"
              type="button"
              onClick={() => setModalState((current) => ({ ...current, open: false }))}
            >
              Got it!
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}