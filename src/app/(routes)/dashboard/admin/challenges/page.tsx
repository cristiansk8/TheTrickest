'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Textarea } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { MdAdd, MdEdit, MdDelete, MdPlayArrow, MdSportsKabaddi } from 'react-icons/md';

interface Challenge {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  points: number;
  demoVideoUrl: string;
  isBonus: boolean;
  createdAt: string;
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  averageScore: number;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'easy',
    points: 100,
    demoVideoUrl: '',
  });

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const openCreateModal = () => {
    setEditingChallenge(null);
    setFormData({
      name: '',
      description: '',
      difficulty: 'easy',
      points: 100,
      demoVideoUrl: '',
    });
    onOpen();
  };

  const openEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name,
      description: challenge.description,
      difficulty: challenge.difficulty,
      points: challenge.points,
      demoVideoUrl: challenge.demoVideoUrl,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const url = editingChallenge ? '/api/admin/challenges' : '/api/admin/challenges';
      const method = editingChallenge ? 'PATCH' : 'POST';
      const body = editingChallenge
        ? { challengeId: editingChallenge.id, action: 'update', ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchChallenges();
        onClose();
      } else {
        console.error('Error saving challenge');
      }
    } catch (error) {
      console.error('Error saving challenge:', error);
    }
    setSaving(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'from-green-500 to-teal-500',
      medium: 'from-yellow-500 to-orange-500',
      hard: 'from-red-500 to-pink-500',
      expert: 'from-purple-500 to-indigo-500',
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getDifficultyBadge = (difficulty: string) => {
    return (
      <span className={`text-xs bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg`}>
        {difficulty}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-wider mb-2">
            🛹 GESTIÓN DE DESAFÍOS
          </h1>
          <p className="text-slate-600 text-lg">
            Crea y administra los challenges de la plataforma
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          startContent={<MdAdd size={20} />}
        >
          Nuevo Desafío
        </Button>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="bg-slate-900 border-4 border-slate-700 shadow-lg hover:shadow-cyan-500/20 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <MdSportsKabaddi size={24} className="text-cyan-400" />
                    <div>
                      <h3 className="text-white font-black text-lg uppercase tracking-wider">
                        {challenge.name}
                      </h3>
                      {getDifficultyBadge(challenge.difficulty)}
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    onClick={() => openEditModal(challenge)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400"
                  >
                    <MdEdit size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {challenge.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Puntos</p>
                    <p className="text-2xl font-black text-yellow-400">{challenge.points}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Submissions</p>
                    <p className="text-2xl font-black text-cyan-400">{challenge.totalSubmissions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-xs uppercase tracking-wider">Avg Score</p>
                    <p className="text-2xl font-black text-green-400">
                      {challenge.averageScore > 0 ? challenge.averageScore.toFixed(1) : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 bg-green-500/20 p-2 rounded text-center">
                    <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Aprobadas</p>
                    <p className="text-green-400 font-black">{challenge.approvedSubmissions}</p>
                  </div>
                  <div className="flex-1 bg-yellow-500/20 p-2 rounded text-center">
                    <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Pendientes</p>
                    <p className="text-yellow-400 font-black">{challenge.pendingSubmissions}</p>
                  </div>
                  <div className="flex-1 bg-red-500/20 p-2 rounded text-center">
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Rechazadas</p>
                    <p className="text-red-400 font-black">{challenge.rejectedSubmissions}</p>
                  </div>
                </div>

                {challenge.demoVideoUrl && (
                  <Button
                    as="a"
                    href={challenge.demoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold uppercase tracking-wider"
                    startContent={<MdPlayArrow size={16} />}
                  >
                    Ver Demo
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        className="bg-slate-900 border-4 border-slate-700"
      >
        <ModalContent>
          <ModalHeader className="text-white font-black uppercase tracking-wider">
            {editingChallenge ? '✏️ EDITAR DESAFÍO' : '➕ CREAR NUEVO DESAFÍO'}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Nombre del Desafío"
              placeholder="Ej: Ollie Perfecto"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="text-white"
            />

            <Textarea
              label="Descripción"
              placeholder="Describe el desafío en detalle..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="text-white"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Dificultad"
                selectedKeys={[formData.difficulty]}
                onSelectionChange={(keys) => setFormData(prev => ({
                  ...prev,
                  difficulty: Array.from(keys)[0] as string
                }))}
              >
                <SelectItem key="easy" value="easy">Fácil</SelectItem>
                <SelectItem key="medium" value="medium">Medio</SelectItem>
                <SelectItem key="hard" value="hard">Difícil</SelectItem>
                <SelectItem key="expert" value="expert">Experto</SelectItem>
              </Select>

              <Input
                label="Puntos"
                type="number"
                placeholder="100"
                value={formData.points.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <Input
              label="URL del Video Demo (YouTube)"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.demoVideoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, demoVideoUrl: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onClose}
              className="bg-slate-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={saving}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold uppercase tracking-wider"
            >
              {editingChallenge ? 'Actualizar' : 'Crear'} Desafío
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}