import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaCog, FaSave } from 'react-icons/fa';

const RuleManagement = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    ruleKey: '',
    ruleName: '',
    ruleValue: '',
    dataType: 'string',
    category: 'general',
    description: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rules');
      setRules(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch rules');
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/rules/${editingRule._id}`, formData);
        toast.success('Rule updated successfully');
      } else {
        await api.post('/rules', formData);
        toast.success('Rule created successfully');
      }
      resetForm();
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (ruleId, isActive) => {
    try {
      await api.put(`/rules/${ruleId}`, { isActive: !isActive });
      toast.success(`Rule ${!isActive ? 'activated' : 'deactivated'}`);
      fetchRules();
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/rules/${ruleId}`);
      toast.success('Rule deleted successfully');
      fetchRules();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const resetForm = () => {
    setFormData({
      ruleKey: '',
      ruleName: '',
      ruleValue: '',
      dataType: 'string',
      category: 'general',
      description: ''
    });
    setEditingRule(null);
    setShowModal(false);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      ruleKey: rule.ruleKey,
      ruleName: rule.ruleName,
      ruleValue: rule.ruleValue,
      dataType: rule.dataType || 'string',
      category: rule.category || 'general',
      description: rule.description || ''
    });
    setShowModal(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      time: 'bg-blue-100 text-blue-800',
      leave: 'bg-green-100 text-green-800',
      overtime: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderValue = (rule) => {
    if (rule.dataType === 'boolean') {
      return rule.ruleValue ? 'Yes' : 'No';
    } else if (rule.dataType === 'array') {
      return rule.ruleValue.join(', ');
    }
    return rule.ruleValue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rules Configuration</h1>
          <p className="text-gray-600 mt-1">Manage attendance rules and settings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <div key={rule._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{rule.ruleName}</h3>
                <p className="text-sm text-gray-500 font-mono">{rule.ruleKey}</p>
              </div>
              <span className={`badge ${getCategoryColor(rule.category)}`}>
                {rule.category}
              </span>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-blue-600">
                {renderValue(rule)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Type: {rule.dataType}
              </div>
            </div>

            {rule.description && (
              <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className={`badge ${rule.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleActive(rule._id, rule.isActive)}
                  className={`text-sm px-2 py-1 rounded ${
                    rule.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {rule.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditModal(rule)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Rule"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Rule"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <FaCog className="text-6xl mx-auto mb-4 text-gray-300" />
            <p>No rules configured yet</p>
            <p className="text-sm">Click "Add Rule" to create your first rule</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingRule ? 'Edit Rule' : 'Add New Rule'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Rule Key (Unique Identifier)</label>
                <input
                  type="text"
                  name="ruleKey"
                  value={formData.ruleKey}
                  onChange={handleInputChange}
                  required
                  disabled={editingRule}
                  className="input-field"
                  placeholder="work_start_time"
                />
                {editingRule && (
                  <p className="text-xs text-gray-500 mt-1">Rule key cannot be changed</p>
                )}
              </div>

              <div>
                <label className="label">Rule Name</label>
                <input
                  type="text"
                  name="ruleName"
                  value={formData.ruleName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Work Start Time"
                />
              </div>

              <div>
                <label className="label">Rule Value</label>
                <input
                  type="text"
                  name="ruleValue"
                  value={formData.ruleValue}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="09:00"
                />
              </div>

              <div>
                <label className="label">Data Type</label>
                <select
                  name="dataType"
                  value={formData.dataType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="time">Time</option>
                  <option value="array">Array</option>
                </select>
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="time">Time</option>
                  <option value="leave">Leave</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Description of the rule"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <FaSave />
                  <span>{editingRule ? 'Update' : 'Create'} Rule</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleManagement;