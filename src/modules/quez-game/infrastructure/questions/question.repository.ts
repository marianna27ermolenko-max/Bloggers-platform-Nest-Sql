import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import { EntityManager, Repository } from 'typeorm';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async save(question: Question): Promise<void> {
    await this.questionRepository.save(question);
  }

  async findQuestion(id: string): Promise<Question | null> {
    const question = await this.questionRepository.findOne({ where: { id } });

    if (!question) {
      return null;
    }

    return question;
  }

  async deleteQuestion(id: string): Promise<void> {
    const result = await this.questionRepository.delete({ id });
    if (result.affected === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'question not found',
      });
    }
  }

  async findRandomFiveQuestions(manager?: EntityManager): Promise<Question[]> {
    const repository = manager
      ? manager.getRepository(Question)
      : this.questionRepository;

    return repository
      .createQueryBuilder()
      .select()
      .where({ published: true })
      .orderBy('random()')
      .take(5)
      .getMany();
  }
}
