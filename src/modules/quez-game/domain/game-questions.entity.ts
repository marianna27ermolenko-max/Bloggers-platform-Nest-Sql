import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Question } from './question.entity';

@Entity()
export class GameQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Game, (game) => game.gameQuestions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @ManyToOne(() => Question, (question) => question.questions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  static createGameQuestion(gameId: string, questionId: string): GameQuestion {
    const gameQuestion = new GameQuestion();
    gameQuestion.gameId = gameId;
    gameQuestion.questionId = questionId;

    return gameQuestion;
  }
}
