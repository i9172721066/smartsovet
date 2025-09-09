export class LocalRepository {
  async getPosts(){ return []; }
  async createPost(){ return { id: '1' }; }
  async likePost(){}

  async addComment(){}

  async getPolls(){ return []; }
  async vote(){}

  async getContacts(){ return []; }
  async createContact(){ return { id: '1' }; }

  async getStats(){ return { posts:0, users:0, polls:0 }; }
  async getTenders(){ return []; }
  async getFinanceRecords(){ return []; }
}
