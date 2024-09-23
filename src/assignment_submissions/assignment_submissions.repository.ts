import { Injectable } from "@nestjs/common";

import { EntityRepository } from "@mikro-orm/postgresql";

import { AssignmentSubmission } from "@/common/entities/assignment-submissions.entity";

@Injectable()
export class AssignmentSubmissionsRepository extends EntityRepository<AssignmentSubmission> {
  async createOne(
    data: Omit<AssignmentSubmission, "id" | "createdAt" | "updatedAt">,
  ): Promise<AssignmentSubmission> {
    const assignmentSubmission = this.create(data);
    await this.em.persistAndFlush(assignmentSubmission);
    return assignmentSubmission;
  }

  async deleteOne(submission: AssignmentSubmission): Promise<void> {
    await this.em.removeAndFlush(submission);
  }
}
