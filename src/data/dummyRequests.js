export const CURRENT_USER_ID = 1;

export const REQUEST_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

const dummyRequests = [
  {
    id: 1,
    fromUserId: 2,
    toUserId: 1,
    offeredSkill: "Python",
    requestedSkill: "React",
    message: "Hi Arun! I can teach you Python basics in exchange for React lessons.",
    status: REQUEST_STATUS.PENDING,
    createdAt: "2026-10-20",
  },
  {
    id: 2,
    fromUserId: 5,
    toUserId: 1,
    offeredSkill: "Guitar",
    requestedSkill: "CSS",
    message: "I would love to learn CSS from you. I can teach you guitar in return.",
    status: REQUEST_STATUS.ACCEPTED,
    createdAt: "2026-10-17",
  },
  {
    id: 3,
    fromUserId: 6,
    toUserId: 1,
    offeredSkill: "UI Design",
    requestedSkill: "JavaScript",
    message: "Can you help me with JavaScript? I can help you with UI design.",
    status: REQUEST_STATUS.REJECTED,
    createdAt: "2026-10-15",
  },
  {
    id: 4,
    fromUserId: 4,
    toUserId: 1,
    offeredSkill: "Spring Boot",
    requestedSkill: "React",
    message: "I can teach you Spring Boot if you can teach me React.",
    status: REQUEST_STATUS.PENDING,
    createdAt: "2026-10-21",
  },
  {
    id: 5,
    fromUserId: 1,
    toUserId: 4,
    offeredSkill: "React",
    requestedSkill: "Java",
    message: "Hi Divya, I can teach you React if you can teach me Java.",
    status: REQUEST_STATUS.PENDING,
    createdAt: "2026-10-19",
  },
  {
    id: 6,
    fromUserId: 1,
    toUserId: 3,
    offeredSkill: "JavaScript",
    requestedSkill: "Photography",
    message: "I would like to learn photography. I can help you with JavaScript.",
    status: REQUEST_STATUS.ACCEPTED,
    createdAt: "2026-10-12",
  },
  {
    id: 7,
    fromUserId: 1,
    toUserId: 6,
    offeredSkill: "CSS",
    requestedSkill: "Public Speaking",
    message: "I can teach you CSS in return for some public speaking tips.",
    status: REQUEST_STATUS.CANCELLED,
    createdAt: "2026-10-10",
  },
];

export default dummyRequests;