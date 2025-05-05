import { model, models, Schema } from 'mongoose';

export interface INode {
  id: string;
  type: string;
  data: {
    label: string;
    description: string;
    nodeType: string;
    connectionCount?: number;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface IEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: {
    strokeDasharray?: string;
  };
  markerEnd?: {
    type: string;
  };
}

export interface IStrategy {
  nodes: INode[];
  edges: IEdge[];
  name: string;
  user: string;
  description?: string; // Make description optional
}

const NodeSchema = new Schema<INode>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  data: {
    label: { type: String, required: true },
    description: { type: String, required: false }, // Make description optional
    nodeType: { type: String, required: true },
    connectionCount: { type: Number, required: false },
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
});

const EdgeSchema = new Schema<IEdge>({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  animated: { type: Boolean, required: false },
  style: {
    strokeDasharray: { type: String, required: false },
  },
  markerEnd: {
    type: { type: String, required: false },
  },
});

const StrategySchema = new Schema<IStrategy>({
  nodes: { type: [NodeSchema], required: true },
  edges: { type: [EdgeSchema], required: true },
  name: { type: String, required: true },
  user: { type: String, required: true }, // Add user field to the schema
  description: { type: String, required: true }, // Add description field to the schema
});

const Strategy = models.Strategy || model<IStrategy>('Strategy', StrategySchema);

export default Strategy;