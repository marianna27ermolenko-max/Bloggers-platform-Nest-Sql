import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { Answer } from './answer.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { GameQuestion } from './game-questions.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @VersionColumn()
  version: number;

  @Column({ type: 'varchar', length: '500' }) //приходит в боди - поставить может ограничение по длине
  body: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  published: boolean;

  @Column({ type: 'jsonb' }) //правельный ответ - лучше здесь пусть лежит или в отдельной таблице - правельных ответов может быть несколько - связь один ко многим
  correctAnswers: string[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.question)
  questions: GameQuestion[];

  static createQuestion(body: string, correctAnswers: string[]): Question {
    const question = new Question();
    question.body = body;
    question.correctAnswers = correctAnswers;
    question.published = false;

    return question;
  }

  updateQuestion(body: string, correctAnswers: string[]): void {
    this.body = body;
    this.correctAnswers = correctAnswers;
    this.updatedAt = new Date();
  }

  updatePublished(published: boolean): void {
    if (published && this.correctAnswers.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
      });
    }
    this.published = published;
    this.updatedAt = new Date();
  }
}
